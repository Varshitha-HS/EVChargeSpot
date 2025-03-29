import { useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/ui/navigation";
import { Menu, X, Zap } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  return (
    <header className="bg-white shadow-md z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <Zap className="h-8 w-8 text-[#00BFA5]" />
                <span className="ml-2 text-lg font-medium text-[#212121]">EV Charge Finder</span>
              </div>
            </Link>
          </div>
          
          <Navigation />
          
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-[#212121] p-2"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden bg-white border-t ${mobileMenuOpen ? "block" : "hidden"}`}>
        <Navigation isMobile />
      </div>
    </header>
  );
};

export default Header;
