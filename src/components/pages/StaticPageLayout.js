export default function StaticPageLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="w-10 h-1 bg-red-600 rounded-full mb-4" />
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">{children}</div>
    </div>
  );
}
