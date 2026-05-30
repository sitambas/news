import Link from 'next/link';

export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return null;
  
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1',
  };

  const style = {
    backgroundColor: category.color ? `${category.color}20` : undefined,
    color: category.color || undefined,
  };

  return (
    <Link href={`/category/${category.slug}`}>
      <span
        className={`inline-block font-semibold rounded-md ${sizeClasses[size]} hover:opacity-80 transition-opacity`}
        style={style}
      >
        {category.name}
      </span>
    </Link>
  );
}
