import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function SectionHeader({ title, subtitle, href, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-red-600 rounded-full" />
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-red-600" />}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          View All <FiArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
