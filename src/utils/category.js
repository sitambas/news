export function getCategoryDisplay(category) {
  if (!category) {
    return { name: '', slug: '', color: '#6B7280', icon: '📰', description: '' };
  }
  return {
    name: category.name || '',
    slug: category.slug || '',
    color: category.color || '#6B7280',
    icon: category.icon || '📰',
    description: category.description || '',
  };
}
