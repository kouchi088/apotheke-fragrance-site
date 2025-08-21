
const Footer = () => {
  return (
    <footer className="w-full py-6 mt-12 border-t border-accent">
      <div className="container mx-auto text-center text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} MEGURID. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
