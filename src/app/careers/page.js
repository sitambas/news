import Link from 'next/link';
import StaticPageLayout from '@/components/pages/StaticPageLayout';
import { FiArrowRight } from 'react-icons/fi';

export const metadata = {
  title: 'करियर',
  description: 'CGFILE में करियर के अवसर — रिपोर्टर, संपादक और डिजिटल मीडिया में नौकरियाँ।',
};

const OPENINGS = [
  {
    title: 'स्थानीय रिपोर्टर',
    location: 'छत्तीसगढ़ (मैदानी)',
    type: 'पार्ट-टाइम / फ्रीलांस',
    desc: 'ज़िला और ब्लॉक स्तर की खबरें कवर करने के लिए अनुभवी या उत्साही रिपोर्टर।',
  },
  {
    title: 'हिंदी संपादक',
    location: 'रिमोट / रायपुर',
    type: 'फुल-टाइम',
    desc: 'लेख संपादन, शीर्षक लेखन और तथ्य-जाँच में दक्षता आवश्यक।',
  },
  {
    title: 'सोशल मीडिया एक्ज़ीक्यूटिव',
    location: 'रिमोट',
    type: 'पार्ट-टाइम',
    desc: 'Facebook, Instagram और YouTube पर समाचार सामग्री प्रबंधन।',
  },
];

export default function CareersPage() {
  return (
    <StaticPageLayout
      title="करियर"
      subtitle="CGFILE टीम में शामिल हों — समाचार और डिजिटल मीडिया में अवसर"
    >
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
        हम मेहनती, ईमानदार और हिंदी में मजबूत लेखन कौशल रखने वाले सहयोगियों की तलाश में हैं।
        यदि आप समाचार जगत में योगदान देना चाहते हैं, तो नीचे दिए अवसर देखें या हमें अपना बायोडाटा भेजें।
      </p>

      <div className="space-y-4 mb-8">
        {OPENINGS.map((job) => (
          <div
            key={job.title}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h2 className="font-bold text-gray-900 dark:text-white">{job.title}</h2>
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full font-medium">
                {job.type}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">📍 {job.location}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{job.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl p-6">
        <h2 className="font-bold text-lg mb-2">आवेदन कैसे करें?</h2>
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          अपना बायोडाटा, पोर्टफोलियो (यदि हो) और संक्षिप्त परिचय के साथ ईमेल करें।
          विषय पंक्ति में पद का नाम अवश्य लिखें।
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          संपर्क करें <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </StaticPageLayout>
  );
}
