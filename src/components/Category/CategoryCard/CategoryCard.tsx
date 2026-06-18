// src/app/components/CategoryCard/CategoryCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    productCount?: number;
    image?: string;
    latestProduct?: {
      mainImage?: string;
      mainImageAlt?: string;
      title?: string;
    };
    slug?: string;
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { _id, name, productCount = 0, image, latestProduct, slug } = category;

  const imageSrc = image || latestProduct?.mainImage || null;
  const imageAlt = latestProduct?.mainImageAlt || name;
  const categoryUrl = slug ? `/categories/${slug}` : `/categories/${_id}`;

  return (
    <Link href={categoryUrl} className="category-card-link group">
      <div className="category-card">

        {/* Image Container */}
        <div className="category-card-image">
          {imageSrc ? (
            <>
              <Image
                src={imageSrc}
                alt={imageAlt}
                className="category-card-img"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
                quality={85}
                loading="lazy"
              />
              <div className="category-card-gradient" />
            </>
          ) : (
            <div className="category-card-fallback">
              <div className="category-card-fallback-content">
                <div className="category-card-fallback-icon">
                  <span className="category-card-fallback-letter">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="category-card-content">
          <div className="category-card-text">
            <h3 className="category-card-title">{name}</h3>
            <div className="category-card-stats">
              <span className="category-card-badge">
                {productCount} {productCount === 1 ? 'item' : 'items'}
              </span>
              <span className="category-card-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="category-card-hover" />
      </div>
    </Link>
  );
};

export default CategoryCard;