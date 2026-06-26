import Link from 'next/link';
import StaticPageLayout from '@/components/pages/StaticPageLayout';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

export const metadata = {
  title: 'विज्ञापन',
  description: 'CGFILE पर विज्ञापन दें — बैनर, स्पॉन्सर्ड कंटेंट और ब्रांड पार्टनरशिप।',
};

const PLANS = [
  {
    name: 'बैनर विज्ञापन',
    desc: 'होमपेज और लेख पृष्ठों पर प्रमुख स्थान पर बैनर।',
    features: ['डेस्कटॉप और मोबाइल', 'क्लिक ट्रैकिंग', 'साप्ताहिक रिपोर्ट'],
  },
  {
    name: 'स्पॉन्सर्ड लेख',
    desc: 'आपके ब्रांड या सेवा पर विशेष लेख या प्रचार सामग्री।',
    features: ['संपादकीय समीक्षा', 'सोशल शेयर', 'SEO लाभ'],
  },
  {
    name: 'ब्रांड पार्टनरशिप',
    desc: 'लंबी अवधि के सहयोग — इवेंट, श्रृंखला और सह-ब्रांडिंग।',
    features: ['कस्टम पैकेज', 'प्राथमिकता प्लेसमेंट', 'समर्पित अकाउंट मैनेजर'],
  },
];

export default function AdvertisePage() {
  return (
    <StaticPageLayout
      title="विज्ञापन"
      subtitle="CGFILE के पाठकों तक पहुँचें — छत्तीसगढ़ और हिंदी समाचार दर्शकों के लिए प्रभावी विज्ञापन"
    >
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
        CGFILE प्रतिदिन हजारों पाठकों तक पहुँचता है। स्थानीय व्यवसाय, सरकारी योजनाएँ,
        शैक्षणिक संस्थान या राष्ट्रीय ब्रांड — सभी के लिए लचीले विज्ञापन विकल्प उपलब्ध हैं।
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">{plan.desc}</p>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <FiCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-2">मीडिया किट और दरें</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          विज्ञापन दर, पाठक आँकड़े और मीडिया किट के लिए हमारी टीम से संपर्क करें।
          हम आपके बजट और लक्ष्य के अनुसार पैकेज तैयार करते हैं।
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          विज्ञापन पूछताछ <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </StaticPageLayout>
  );
}
