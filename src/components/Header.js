import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "./CartDrawer";

// const LOGO_URL =
  // "https://res.cloudinary.com/dxfs7qyzm/image/upload/v1779338649/Bree-logo_xgn0eh.png";
const LOGO_URL =
  "/images/logo.PNG";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Benefits", path: "/benefits" },
  { name: "Bulk", path: "/bulk" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        data-testid="header"
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-bree-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center" data-testid="logo-link cursor-pointer">
              <img
                src={LOGO_URL}
                alt="BREE"
                className="h-16 md:h-20 lg:h-24 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-${link.name.toLowerCase()}`}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? "text-bree-primary"
                      : "text-bree-text-secondary hover:text-bree-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Auth */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/profile"
                    data-testid="profile-link"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-bree-bg transition-colors"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt="profile"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-bree-accent/40 flex items-center justify-center">
                        <User className="w-4 h-4 text-bree-primary" />
                      </div>
                    )}

                    <span className="text-sm text-bree-text-secondary">
                      {user.name?.split(" ")[0]}
                    </span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  data-testid="login-btn"
                  className="hidden md:flex items-center gap-2 px-4 py-2 border border-bree-border rounded-full hover:bg-bree-bg transition-colors text-sm font-medium text-bree-text-secondary"
                >
                  Login
                </Link>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                data-testid="cart-button"
                className="relative p-2 rounded-full hover:bg-bree-accent/20 transition-colors"
              >
                <ShoppingBag className="w-6 h-6 text-bree-text-primary" />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-bree-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="mobile-menu-toggle"
                className="md:hidden p-2 rounded-full hover:bg-bree-accent/20 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-bree-text-primary" />
                ) : (
                  <Menu className="w-6 h-6 text-bree-text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-bree-border/50">
            <nav className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                  className={`block py-3 text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-bree-primary"
                      : "text-bree-text-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Auth */}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    data-testid="mobile-nav-profile"
                    className="block py-3 text-base font-medium text-bree-text-secondary"
                  >
                    My Profile
                  </Link>

                  {/* Logout ONLY in mobile view */}
                  <button
                    onClick={logout}
                    data-testid="mobile-logout-button"
                    className="block w-full text-left py-3 text-base font-medium text-red-500"
                  >
                    Log Out ({user.name?.split(" ")[0]})
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block py-3 text-base font-medium text-bree-primary"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
