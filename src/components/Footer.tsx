
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-12 border-t border-accent">
      <div className="container mx-auto text-center text-secondary text-sm">
        <div className="flex justify-center space-x-4 mb-2">
          <Link href="/legal" className="hover:text-primary">特定商取引法に基づく表記</Link>
          <Link href="/privacy" className="hover:text-primary">プライバシーポリシー</Link>
          <Link href="/terms" className="hover:text-primary">利用規約</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} MEGURID. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
