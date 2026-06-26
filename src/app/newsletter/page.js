import StaticPageLayout from '@/components/pages/StaticPageLayout';
import NewsletterForm from '@/components/pages/NewsletterForm';

export const metadata = {
  title: 'न्यूज़लेटर',
  description: 'CGFILE न्यूज़लेटर की सदस्यता लें — ताज़ा खबरें सीधे अपने ईमेल में।',
};

export default function NewsletterPage() {
  return (
    <StaticPageLayout
      title="न्यूज़लेटर"
      subtitle="प्रतिदिन की महत्वपूर्ण खबरें, ब्रेकिंग अपडेट और विशेष विश्लेषण — सीधे आपके इनबॉक्स में"
    >
      <div className="space-y-6">
        <NewsletterForm />

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">आपको क्या मिलेगा?</h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• दिन की सबसे महत्वपूर्ण ब्रेकिंग खबरें</li>
            <li>• छत्तीसगढ़ और स्थानीय समाचार का सारांश</li>
            <li>• विशेष रिपोर्ट और विश्लेषण</li>
            <li>• कभी भी सदस्यता रद्द करें — एक क्लिक में</li>
          </ul>
        </div>

        <p className="text-xs text-gray-400 text-center">
          हम आपका ईमेल किसी तीसरे पक्ष के साथ साझा नहीं करते।{' '}
          <a href="/privacy" className="text-red-600 hover:underline">गोपनीयता नीति</a> पढ़ें।
        </p>
      </div>
    </StaticPageLayout>
  );
}
