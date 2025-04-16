const Footer = () => {
  return (
    <footer className="py-8 px-4 md:px-8 border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Leftover</span>
          </div>
          <div className="text-sm text-black/70 dark:text-white/70">
            © {new Date().getFullYear()} Leftover. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 