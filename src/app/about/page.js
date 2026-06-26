import StaticPageLayout from '@/components/pages/StaticPageLayout';

export const metadata = {
  title: 'हमारे बारे में',
  description: 'CGFILE के बारे में जानें — छत्तीसगढ़ और भारत की विश्वसनीय हिंदी समाचार वेबसाइट।',
};

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="हमारे बारे में"
      subtitle="CGFILE — छत्तीसगढ़ और देश भर की खबरों के लिए आपका विश्वसनीय डिजिटल मंच"
    >
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
        <p>
          <strong className="text-gray-900 dark:text-white">CGFILE</strong> एक हिंदी समाचार प्लेटफ़ॉर्म है जो
          छत्तीसगढ़, सरगुजा और पूरे भारत की ताज़ा, सटीक और निष्पक्ष खबरें पाठकों तक पहुँचाता है।
          हमारा उद्देश्य स्थानीय घटनाओं से लेकर राष्ट्रीय और अंतर्राष्ट्रीय महत्व की खबरों तक
          हर पहलू को स्पष्ट और विश्वसनीय तरीके से प्रस्तुत करना है।
        </p>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">हमारा मिशन</h2>
          <p>
            पाठकों को समय पर सूचित रखना, गहन रिपोर्टिंग करना और समाज में जागरूकता बढ़ाना।
            हम हर खबर में तथ्य, संदर्भ और स्थानीय संवेदनशीलता को प्राथमिकता देते हैं।
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">हम क्या करते हैं</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ब्रेकिंग न्यूज़ और ताज़ा अपडेट</li>
            <li>ज़िला और क्षेत्रीय स्तर की रिपोर्टिंग</li>
            <li>राजनीति, अपराध, स्वास्थ्य, खेल और अन्य श्रेणियों में विश्लेषण</li>
            <li>स्थानीय रिपोर्टरों के माध्यम से मैदानी खबरें</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">संपादकीय मानक</h2>
          <p>
            CGFILE पर प्रकाशित सभी सामग्री तथ्य-आधारित, सत्यापन योग्य और निष्पक्ष होने का प्रयास करती है।
            हम गलत सूचना का विरोध करते हैं और त्रुटि सुधार के लिए हमेशा तैयार रहते हैं।
          </p>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">संपर्क</h2>
          <p className="mb-1">ईमेल: <a href="mailto:news@cgfile.in" className="text-red-600 hover:underline">news@cgfile.in</a></p>
          <p>वेबसाइट: <a href="https://cgfile.in" className="text-red-600 hover:underline">cgfile.in</a></p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
