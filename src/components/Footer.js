import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import DevelopedByStaffArc from "./DevelopedByStaffArc";

const LOGO_URL =
  "https://res.cloudinary.com/dxfs7qyzm/image/upload/v1778914388/Logo_klki4p.png";

const Footer = () => {
  return (
    <footer data-testid="footer" className="bg-bree-text-primary text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src={LOGO_URL}
              alt="BREE"
              className="h-12 w-auto rounded-lg bg-white/90 p-1"
            />
            <p className="text-white/70 text-sm leading-relaxed">
              Pure Amla wellness shots for your daily ritual. Rise. Sip. Glow.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                data-testid="social-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                data-testid="social-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                data-testid="social-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-outfit font-semibold text-lg mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Shop", "Benefits", "About", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-outfit font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {["FAQs", "Shipping", "Returns", "Privacy Policy", "Terms"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-outfit font-semibold text-lg mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-bree-accent mt-0.5" />
                <span className="text-white/70 text-sm">
                  bree.fit.india@gmail.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-bree-accent mt-0.5" />
                <span className="text-white/70 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-bree-accent mt-0.5" />
                <span className="text-white/70 text-sm">Hyderabad, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} BREE Wellness. All rights
              reserved.
            </p>

            <DevelopedByStaffArc />

            <div className="flex items-center gap-4">
              <img
                src="https://razorpay.com/assets/razorpay-logo.svg"
                alt="Razorpay"
                className="h-5 opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
