export default function LegalPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">特定商取引法に基づく表記</h1>

      <h2 className="text-2xl font-semibold mt-8 mb-4">販売業者</h2>
      <p>（ここに法人名または個人事業主名を記載）</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">運営責任者</h2>
      <p>（代表者氏名を記載）</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">所在地</h2>
      <p>（郵便番号＋住所を記載）</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">電話番号</h2>
      <p>（電話番号を記載）</p>
      <p className="text-sm text-gray-600">※営業電話防止のため、電話での対応は行っておりません。お問い合わせは下記メールフォームをご利用ください。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">メールアドレス</h2>
      <p>（お問い合わせ用メールアドレスを記載）</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">販売価格</h2>
      <p>各商品ページに税込価格を表示しています。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">商品代金以外の必要料金</h2>
      <ul className="list-disc list-inside ml-4">
        <li>送料：全国一律〇〇円（離島・一部地域を除く）</li>
        <li>振込手数料（銀行振込をご利用の場合）</li>
        <li>その他、決済手数料が発生する場合は商品ページに記載</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">支払方法</h2>
      <ul className="list-disc list-inside ml-4">
        <li>クレジットカード（Stripe決済）</li>
        <li>銀行振込</li>
        <li>その他、商品ページに記載の方法</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">支払時期</h2>
      <ul className="list-disc list-inside ml-4">
        <li>クレジットカード：ご注文時に即時決済</li>
        <li>銀行振込：ご注文から5営業日以内にお振込ください</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">商品の引渡時期</h2>
      <ul className="list-disc list-inside ml-4">
        <li>在庫商品：決済完了後、3営業日以内に発送します</li>
        <li>受注生産品：商品ページに記載の納期をご確認ください</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">返品・交換・キャンセルについて</h2>
      <ul className="list-disc list-inside ml-4">
        <li>商品不良・誤配送の場合、到着後7日以内にご連絡ください。</li>
        <li>お客様都合による返品・キャンセルは原則お受けできません。</li>
        <li>商品到着後8日以上経過した場合の返品はお受けできません。</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">不良品対応</h2>
      <ul className="list-disc list-inside ml-4">
        <li>不良品・誤配送の場合は、送料当社負担にて交換または返金対応いたします。</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">販売数量の制限</h2>
      <ul className="list-disc list-inside ml-4">
        <li>数量限定品・受注生産品は商品ページにて数量制限を明示します。</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">申込有効期限</h2>
      <ul className="list-disc list-inside ml-4">
        <li>銀行振込の場合、ご注文日から5営業日以内にご入金がない場合はキャンセル扱いとなります。</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">動作環境</h2>
      <ul className="list-disc list-inside ml-4">
        <li>当サイトは最新のGoogle Chrome、Safari、Firefoxでのご利用を推奨します。</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">販売条件</h2>
      <ul className="list-disc list-inside ml-4">
        <li>日本国内のみの販売対応です（海外発送は対応しておりません）。</li>
      </ul>
    </main>
  );
}