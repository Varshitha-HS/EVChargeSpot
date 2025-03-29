import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const Navigation = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const isActive = (path: string) => location === path;
  
  const linkClasses = (path: string) => {
    if (isMobile) {
      return `block px-3 py-2 rounded-md text-base font-medium ${
        isActive(path)
          ? "bg-primary text-white"
          : "text-[#212121] hover:bg-[#F5F5F5]"
      }`;
    }
    
    return `text-sm ${
      isActive(path)
        ? "text-primary"
        : "text-[#212121] hover:text-primary"
    } transition duration-150 px-3 py-2 rounded-md`;
  };
  
  return (
    <div className={isMobile ? "px-2 pt-2 pb-3 space-y-1" : "hidden md:flex items-center space-x-4"}>
      <Link href="/" className={linkClasses("/")}>
        Find Stations
      </Link>
      
      {isAuthenticated && (
        <Link href="/bookings" className={linkClasses("/bookings")}>
          My Bookings
        </Link>
      )}
      
      {isAuthenticated && user?.role === "admin" && (
        <Link href="/admin" className={linkClasses("/admin")}>
          Admin Dashboard
        </Link>
      )}
      
      {!isAuthenticated ? (
        <button className="bg-[#00BFA5] text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition duration-150">
          Login
        </button>
      ) : (
        <button 
          onClick={logout}
          className="text-sm text-[#212121] hover:text-primary transition duration-150 px-3 py-2 rounded-md"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Navigation;
