"use client";

import { useEffect, useRef } from "react";

const Footer = () => {
  const buyMeACoffeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create and load the Buy Me a Coffee script
    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "mofodox"); // Replace with your Buy Me a Coffee username
    script.setAttribute("data-description", "Support Leftover App Development");
    script.setAttribute("data-message", "Thank you for using Leftover. Buy me a coffee if you find it helpful!");
    script.setAttribute("data-color", "#40dca5");
    script.setAttribute("data-position", "right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;
    
    // This ensures the widget actually loads after the script is added
    script.onload = function() {
      const evt = document.createEvent("Event");
      evt.initEvent("DOMContentLoaded", false, false);
      window.dispatchEvent(evt);
    };
    
    // Check if the button already exists to prevent duplicates
    if (!document.querySelector('[data-name="BMC-Widget"]')) {
      document.head.appendChild(script);
    }
    
    // Cleanup on component unmount
    return () => {
      if (document.querySelector('[data-name="BMC-Widget"]')) {
        document.head.removeChild(script);
        const button = document.getElementById("bmc-wbtn");
        if (button && button.parentNode) {
          button.parentNode.removeChild(button);
        }
      }
    };
  }, []);

  return (
    <footer className="py-8 px-4 md:px-8 border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Leftover</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-black/70 dark:text-white/70">
              © {new Date().getFullYear()} Leftover. All rights reserved.
            </div>
          </div>
        </div>
      </div>
      <div ref={buyMeACoffeeRef} id="bmc-widget-container"></div>
      
      {/* Add custom CSS for Buy Me a Coffee widget */}
      <style jsx global>{`
        #bmc-wbtn {
          bottom: 70px !important;
        }
        
        #bmc-wbtn + div {
          bottom: 70px !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer; 