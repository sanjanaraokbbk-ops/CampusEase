import { Mail, MapPin, Phone } from 'lucide-react';
import { PageView, ProductCategory } from '../types/campus';

interface FooterProps {
  onNavigate: (view: PageView, category?: ProductCategory) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#231044] text-[#EDE7F9] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/12">
          {/* Brand Summary */}
          <div className="space-y-3">
            <div className="font-display text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#EFEAF9] text-[#2A1254] inline-flex items-center justify-center text-xs font-bold">
                CE
              </span>
              <span>CampusEase</span>
            </div>
            <p className="text-sm text-[#CFC4E8] leading-relaxed">
              Campus Life, Made Easier. Everyday student essentials and on-campus services built
              for DBS Global University students in Dehradun.
            </p>
            <p className="text-xs text-[#9E8EC4] pt-1">
              Academic Pilot MVP · Demonstration platform using browser local storage.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm text-[#CFC4E8]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('essentials')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Explore Essentials
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Book a Campus Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('student')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Student Hub &amp; Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Demo Admin Console
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm text-[#CFC4E8]">
              {Object.values(ProductCategory).map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => onNavigate('essentials', category)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Campus Desk */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Campus Support Desk
            </h3>
            <ul className="space-y-3 text-sm text-[#CFC4E8]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#7DD3FC] shrink-0 mt-0.5" />
                <span>DBS Global University Campus, Dehradun, Uttarakhand</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                <span className="tabular-nums">+91 90000 12345 (Demo Helpdesk)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#7DD3FC] shrink-0" />
                <span>support@campusease-dgu.demo</span>
              </li>
            </ul>
            <p className="text-xs text-[#A99BCE] mt-4 leading-relaxed">
              Pilot Hours: 08:30 AM – 09:00 PM IST. Over-the-counter first-aid supplies only; no
              prescription medicines sold without verification.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A99BCE]">
          <p>© {new Date().getFullYear()} CampusEase — Built for DBS Global University Students.</p>
          <p>Prototype MVP · Simulated fulfillment &amp; no real payment processing</p>
        </div>
      </div>
    </footer>
  );
}
