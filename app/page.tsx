import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Calculate Your Disposable Income in Seconds
              </h1>
              <p className="text-lg md:text-xl text-black/70 dark:text-white/70 max-w-2xl">
                Stay on top of your finances with our simple, quick, and accurate disposable income calculator. Know exactly how much money you have left after essential expenses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/calculator" 
                  className="rounded-full bg-foreground text-background px-6 py-3 text-base font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="rounded-full border border-black/10 dark:border-white/10 px-6 py-3 text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md h-80 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg hidden lg:inline-block shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 w-4/5 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Income:</span>
                        <span className="font-mono font-semibold">$5,000.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Expenses:</span>
                        <span className="font-mono font-semibold">$3,200.00</span>
                      </div>
                      <div className="h-px bg-black/10 dark:bg-white/10"></div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Disposable Income:</span>
                        <span className="font-mono font-semibold text-green-600 dark:text-green-400">$1,800.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 md:px-8 bg-black/5 dark:bg-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Fast, and Accurate</h2>
              <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
                Our calculator gives you the tools you need to understand your financial situation at a glance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600 dark:text-blue-400">
                    <path d="m8 6 4-4 4 4" />
                    <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22" />
                    <path d="m20 22-5-5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Input</h3>
                <p className="text-black/70 dark:text-white/70">
                  Quickly enter your income and expenses with our intuitive interface
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600 dark:text-purple-400">
                    <path d="M12 22V8" />
                    <path d="m2 10 10-8 10 8" />
                    <path d="M15 22v-8a3 3 0 0 0-6 0v8" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Save Categories</h3>
                <p className="text-black/70 dark:text-white/70">
                  Categorize your expenses to better understand your spending habits
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600 dark:text-green-400">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
                <p className="text-black/70 dark:text-white/70">
                  Get your disposable income calculated instantly with real-time updates
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
                Three simple steps to calculate your disposable income
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-background border-2 border-black/10 dark:border-white/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Enter Your Income</h3>
                <p className="text-black/70 dark:text-white/70">
                  Input your monthly salary, wages, and any additional income sources
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-background border-2 border-black/10 dark:border-white/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Your Expenses</h3>
                <p className="text-black/70 dark:text-white/70">
                  List your essential expenses such as rent, utilities, groceries, and loans
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-background border-2 border-black/10 dark:border-white/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Your Results</h3>
                <p className="text-black/70 dark:text-white/70">
                  See your disposable income calculation and make informed financial decisions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 md:px-8 bg-black/5 dark:bg-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Out Your Disposable Income?</h2>
            <p className="text-lg text-black/70 dark:text-white/70 mb-8 max-w-2xl mx-auto">
              Start using our calculator today and take control of your finances. It's free, quick, and helps you make better financial decisions.
            </p>
            <Link 
              href="/calculator" 
              className="rounded-full bg-foreground text-background px-8 py-4 text-lg font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors inline-block"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
