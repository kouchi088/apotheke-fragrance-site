export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>

      <p>（以下「当サイト」といいます）は、当サイトのサービスを利用するお客様（以下「ユーザー」といいます）の個人情報を保護するため、以下の方針に従って適切に取り扱います。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. 取得する個人情報</h2>
      <p>当サイトは以下の情報を取得することがあります。</p>
      <ul className="list-disc list-inside ml-4">
        <li>氏名、住所、電話番号、メールアドレス</li>
        <li>決済に必要な情報（Stripe等の決済代行サービスを通じて取得）</li>
        <li>配送先情報</li>
        <li>購入履歴やアクセス履歴などの利用状況</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. 個人情報の利用目的</h2>
      <p>当サイトは取得した個人情報を、以下の目的のために使用します。</p>
      <ul className="list-disc list-inside ml-4">
        <li>商品の発送および決済のため</li>
        <li>注文に関する確認やサポート対応</li>
        <li>キャンペーンや新商品情報等のご案内（メール配信など）</li>
        <li>サービス改善のための分析</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. 個人情報の第三者提供</h2>
      <p>当サイトは、次の場合を除き、個人情報を第三者に提供することはありません。</p>
      <ul className="list-disc list-inside ml-4">
        <li>ユーザーの同意がある場合</li>
        <li>法令に基づく場合</li>
        <li>商品配送や決済処理のために業務委託先へ提供する場合</li>
        <ul className="list-disc list-inside ml-8">
          <li>（例：Stripe、配送業者など）</li>
        </ul>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. 個人情報の管理</h2>
      <p>当サイトは、取得した個人情報を適切に管理し、不正アクセス・紛失・改ざん・漏洩を防ぐための安全対策を講じます。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. 個人情報の開示・訂正・削除</h2>
      <p>ユーザーは、当サイトが保有する自身の個人情報について、開示・訂正・削除を求めることができます。</p>
      <p>お問い合わせは以下のメールアドレスまでお願いいたします。</p>
      <p>（お問い合わせ用メールアドレスを記載）</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookieの利用について</h2>
      <p>当サイトでは、ユーザー体験向上や分析のためCookieを使用することがあります。</p>
      <p>Cookie利用を望まない場合はブラウザ設定で無効にできます。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. 改訂</h2>
      <p>本ポリシーは必要に応じて改訂される場合があります。改訂後は当ページにて通知します。</p>
    </main>
  );
}