import StaticPageLayout from '@/components/pages/StaticPageLayout';
import ContactForm from '@/components/pages/ContactForm';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

export const metadata = {
  title: 'संपर्क करें',
  description: 'CGFILE से संपर्क करें — समाचार, सुझाव और सहयोग के लिए।',
};

export default function ContactPage() {
  return (
    <StaticPageLayout
      title="संपर्क करें"
      subtitle="समाचार, सुझाव, सहयोग या किसी भी प्रश्न के लिए हमसे जुड़ें"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { icon: FiMail, label: 'ईमेल', value: 'news@cgfile.in', href: 'mailto:news@cgfile.in' },
          { icon: FiMapPin, label: 'क्षेत्र', value: 'छत्तीसगढ़, भारत' },
          { icon: FiPhone, label: 'समय', value: 'सोम–शनि, 10 AM – 6 PM' },
        ].map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              {href ? (
                <a href={href} className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600">
                  {value}
                </a>
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <ContactForm />
    </StaticPageLayout>
  );
}
