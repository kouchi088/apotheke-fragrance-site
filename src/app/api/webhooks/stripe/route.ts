import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

// Stripeクライアントの初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // checkout時とバージョンを合わせる
});

// Resendクライアントの初期化
const resend = new Resend(process.env.RESEND_API_KEY!);

// Stripe Webhookのシークレットキー
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  // Stripeからのリクエスト署名を検証
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // 'checkout.session.completed'イベントを処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'お客様';

    if (!customerEmail) {
      console.error('Customer email not found in checkout session.');
      // メールアドレスがない場合は、ここで処理を終了する
      return NextResponse.json({ received: true, message: 'No email to send.' });
    }

    try {
      // Resendを使って購入確認メールを送信
      await resend.emails.send({
        from: 'APOTHEKE FRAGRANCE <noreply@yourdomain.com>', // Resendで設定・認証したドメインのメールアドレスに変更してください
        to: customerEmail,
        subject: '【APOTHEKE FRAGRANCE】ご注文ありがとうございます',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h1 style="font-size: 1.5em;">ご注文ありがとうございます</h1>
            <p>${customerName}様</p>
            <p>この度は、APOTHEKE FRAGRANCEをご利用いただき、誠にありがとうございます。</p>
            <p>ご注文内容の詳細は、ウェブサイトの注文履歴よりご確認いただけます。</p>
            <p>商品の発送まで、今しばらくお待ちくださいませ。</p>
            <br>
            <p>APOTHEKE FRAGRANCE</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">ウェブサイトに戻る</a></p>
          </div>
        `,
      });
      console.log(`Purchase confirmation email sent to ${customerEmail}`);
    } catch (error) {
      console.error('Error sending email:', error);
      // メール送信に失敗しても、Stripeには成功したことを伝えるため200を返す
      // ここで500を返すと、StripeがWebhookを再送し続けてしまう
    }
  } else {
    console.warn(`Unhandled event type: ${event.type}`);
  }

  // Stripeに正常に受信したことを伝える
  return NextResponse.json({ received: true });
}
