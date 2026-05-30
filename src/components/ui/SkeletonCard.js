export default function SkeletonCard({ variant = 'default' }) {
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
        <div className="skeleton w-24 h-24 rounded-lg flex-shrink-0 bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="skeleton h-4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="skeleton h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="skeleton h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="skeleton aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="skeleton h-4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="skeleton h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="skeleton h-3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="skeleton h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex justify-between mt-3">
          <div className="skeleton h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="skeleton h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
