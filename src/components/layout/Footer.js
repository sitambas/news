import Link from 'next/link';
import { FiTwitter, FiFacebook, FiInstagram, FiYoutube, FiLinkedin, FiMail, FiRss } from 'react-icons/fi';

const CATEGORIES = [
  { label: 'राजनीति', href: '/category/politics' },
  { label: 'तकनीक', href: '/category/technology' },
  { label: 'व्यापार', href: '/category/business' },
  { label: 'विज्ञान', href: '/category/science' },
  { label: 'खेल', href: '/category/sports' },
  { label: 'मनोरंजन', href: '/category/entertainment' },
  { label: 'स्वास्थ्य', href: '/category/health' },
  { label: 'विश्व', href: '/category/world' },
];

const COMPANY_LINKS = [
  { label: 'हमारे बारे में', href: '/about' },
  { label: 'संपर्क करें', href: '/contact' },
  { label: 'करियर', href: '/careers' },
  { label: 'विज्ञापन', href: '/advertise' },
  { label: 'न्यूज़लेटर', href: '/newsletter' },
];

const LEGAL_LINKS = [
  { label: 'गोपनीयता नीति', href: '/privacy' },
  { label: 'सेवा की शर्तें', href: '/terms' },
  { label: 'कुकी नीति', href: '/cookies' },
  { label: 'साइटमैप', href: '/sitemap.xml' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-red-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">हमारे न्यूज़लेटर से जुड़े रहें</h3>
              <p className="text-red-100 text-sm">नवीनतम खबरें सीधे आपके इनबॉक्स में पाएं</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="अपना ईमेल दर्ज करें"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-4 py-2 bg-white text-red-600 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors">
                सदस्यता लें
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
          <Link href="/" className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tight">CG</span>
            </div>
            <span className="text-xl font-black tracking-tight">CG<span className="text-red-400">FILE</span></span>
          </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              ब्रेकिंग न्यूज़, गहन विश्लेषण और सबसे महत्वपूर्ण खबरों के लिए आपका विश्वसनीय स्रोत।
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
                { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube' },
                { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white mb-4">श्रेणियाँ</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link href={cat.href} className="text-gray-400 hover:text-red-400 text-sm transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">कंपनी</h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-red-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & RSS */}
          <div>
            <h4 className="font-bold text-white mb-4">जुड़ें</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:news@cgfile.com" className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors">
                  <FiMail className="w-4 h-4" /> news@cgfile.com
                </a>
              </li>
              <li>
                <Link href="/rss.xml" className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors">
                  <FiRss className="w-4 h-4" /> RSS फ़ीड
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-bold text-white mb-3 text-sm">ऐप डाउनलोड करें</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-400 hover:bg-gray-700 transition-colors text-center">
                  📱 App Store
                </a>
                <a href="#" className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-400 hover:bg-gray-700 transition-colors text-center">
                  🤖 Google Play
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} CGFILE। सभी अधिकार सुरक्षित।
            </p>
            <div className="flex items-center gap-4">
              {LEGAL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
