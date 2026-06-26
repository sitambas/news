'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoryNavLinks({ className = '', linkClassName = '' }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data || []);
      })
      .catch(() => {});
  }, []);

  if (!categories.length) return null;

  return (
    <>
      {categories.map((cat) => (
        <Link
          key={cat._id || cat.slug}
          href={`/category/${cat.slug}`}
          className={linkClassName || className}
        >
          {cat.icon ? `${cat.icon} ` : ''}{cat.name}
        </Link>
      ))}
    </>
  );
}

export function FooterCategoryLinks() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data || []);
      })
      .catch(() => {});
  }, []);

  return (
    <ul className="space-y-2">
      {categories.map((cat) => (
        <li key={cat._id || cat.slug}>
          <Link href={`/category/${cat.slug}`} className="text-gray-400 hover:text-red-400 text-sm transition-colors">
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
