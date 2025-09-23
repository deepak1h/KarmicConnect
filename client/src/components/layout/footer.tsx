import { Link } from "wouter";
import { Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div data-testid="footer-brand">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-accent text-accent-foreground p-2 rounded-lg">
                <Truck className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold" data-testid="footer-brand-title">Karmic International</h3>
                <p className="text-xs opacity-80" data-testid="footer-brand-subtitle">Premium Textile Exports</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed" data-testid="footer-brand-description">
              Your trusted partner for premium textile exports worldwide. Quality guaranteed, delivery assured.
            </p>
          </div>

          <div data-testid="footer-products">
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/category/garment" className="hover:opacity-100 transition-opacity" data-testid="footer-link-garment">Garment</Link></li>
              <li><Link href="/category/fabric" className="hover:opacity-100 transition-opacity" data-testid="footer-link-fabric">Fabric</Link></li>
              <li><Link href="/category/yarn" className="hover:opacity-100 transition-opacity" data-testid="footer-link-yarn">Yarn</Link></li>
              <li><Link href="/category/home-textiles" className="hover:opacity-100 transition-opacity" data-testid="footer-link-home-textiles">Home Textiles</Link></li>
              <li><Link href="/category/fiber-feedstock" className="hover:opacity-100 transition-opacity" data-testid="footer-link-fiber-feedstock">Fiber & Feedstock</Link></li>
            </ul>
          </div>

          <div data-testid="footer-company">
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/#about" className="hover:opacity-100 transition-opacity" data-testid="footer-link-about">About Us</Link></li>
              <li><Link href="/admin/login" className="hover:opacity-100 transition-opacity" data-testid="footer-link-contact">Admin</Link></li>
              <li><Link href="/quotation" className="hover:opacity-100 transition-opacity" data-testid="footer-link-quote">Get Quote</Link></li>
              <li><span className="hover:opacity-100 transition-opacity cursor-pointer" data-testid="footer-link-privacy">Privacy Policy</span></li>
              <li><span className="hover:opacity-100 transition-opacity cursor-pointer" data-testid="footer-link-terms">Terms of Service</span></li>
            </ul>
          </div>

          <div data-testid="footer-social">
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-3">
              <a href="#" className="bg-primary-foreground bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-colors" data-testid="social-link-linkedin">
                💼
              </a>
              <a href="#" className="bg-primary-foreground bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-colors" data-testid="social-link-twitter">
                🐦
              </a>
              <a href="#" className="bg-primary-foreground bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-colors" data-testid="social-link-facebook">
                📘
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground border-opacity-20 pt-8 text-center">
          <p className="text-sm opacity-80" data-testid="footer-copyright">
            &copy; 2024 Karmic International. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
