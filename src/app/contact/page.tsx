// src/app/contact/page.tsx

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">Contact Us</h1>
        <p className="text-center text-gray-600 mb-12">
          製品に関するご質問、コラボレーションのご提案など、お気軽にお問い合わせください。
        </p>

        <form className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">お名前</label>
            <input type="text" id="name" name="name" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-800 focus:border-gray-800" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
            <input type="email" id="email" name="email" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-800 focus:border-gray-800" />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">お問い合わせ内容</label>
            <textarea id="message" name="message" rows={6} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gray-800 focus:border-gray-800"></textarea>
          </div>

          <div className="text-center">
            <button 
              type="submit"
              className="primary-button inline-block disabled:opacity-50"
              disabled // Form submission is not implemented
            >
              送信 (現在無効)
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}