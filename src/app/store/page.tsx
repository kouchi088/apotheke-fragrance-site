
// src/app/store/page.tsx

export default function StorePage() {
  return (
    <main className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-section-title font-bold mb-md">Store Locations</h1>
      <p className="text-body-large text-charcoal mb-xxl">
        Our physical stores offer a unique sensory experience.
      </p>
      <div className="max-w-2xl mx-auto space-y-lg">
        <div className="bg-pure-white p-lg rounded-lg shadow-sm">
          <h2 className="text-sub-title font-semibold mb-sm">Tokyo Flagship Store</h2>
          <p className="text-body text-silver-gray">1-2-3 Ginza, Chuo-ku, Tokyo</p>
          <p className="text-body text-silver-gray">Opening Hours: 11:00 - 20:00</p>
        </div>
        <div className="bg-pure-white p-lg rounded-lg shadow-sm">
          <h2 className="text-sub-title font-semibold mb-sm">Osaka Pop-up Store</h2>
          <p className="text-body text-silver-gray">4-5-6 Umeda, Kita-ku, Osaka</p>
          <p className="text-body text-silver-gray">Opening Hours: 10:00 - 19:00 (Limited Time)</p>
        </div>
      </div>
    </main>
  );
}
