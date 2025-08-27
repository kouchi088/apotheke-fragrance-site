export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">利用規約</h1>

      <p>この利用規約（以下「本規約」といいます）は、当サイトの利用条件を定めるものです。</p>
      <p>当サイトを利用することで、本規約に同意したものとみなします。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第1条（適用）</h2>
      <p>本規約は、ユーザーと当サイト運営者との間の本サービス利用に関わる一切の関係に適用されます。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第2条（禁止事項）</h2>
      <p>ユーザーは、以下の行為を禁止します。</p>
      <ul className="list-disc list-inside ml-4">
        <li>虚偽の情報登録</li>
        <li>転売目的での商品購入</li>
        <li>当サイトの運営を妨げる行為</li>
        <li>法令または公序良俗に違反する行為</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第3条（商品の購入）</h2>
      <ul className="list-disc list-inside ml-4">
        <li>商品の写真はできる限り実物に近い色を再現していますが、閲覧環境によって差異が生じる場合があります。</li>
        <li>在庫状況や納期は商品ページに記載します。</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第4条（返品・キャンセル）</h2>
      <p>返品・キャンセルについては「特定商取引法に基づく表記」に従います。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第5条（知的財産権）</h2>
      <p>当サイト上で提供される画像・文章・ロゴ等の著作権は当サイトまたは正当な権利者に帰属します。無断転載・複製を禁止します。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第6条（免責事項）</h2>
      <ul className="list-disc list-inside ml-4">
        <li>サイト利用や商品の使用により生じた損害について、当サイトは一切の責任を負いません。</li>
        <li>天災、配送業者の遅延など、不可抗力による損害についても同様です。</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第7条（規約の変更）</h2>
      <p>当サイトは、必要に応じて本規約を変更することがあります。変更後は当ページにて告知します。</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第8条（準拠法・管轄裁判所）</h2>
      <p>本規約は日本法を準拠法とし、本サービスに関して紛争が生じた場合は、当サイト運営者の所在地を管轄する裁判所を専属的合意管轄とします。</p>
    </main>
  );
}