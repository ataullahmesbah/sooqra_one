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

  // Priority: category.image -> latestProduct.mainImage
  const imageSrc = image || latestProduct?.mainImage || null;
  const imageAlt = latestProduct?.mainImageAlt || name;

  const categoryUrl = slug ? `/categories/${slug}` : `/categories/${_id}`;

  return (
    <Link href={categoryUrl} className="group block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg">
      <div className="relative aspect-square bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 overflow-hidden">

        {/* Image Container */}
        <div className="absolute inset-0">
          {imageSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                quality={90}
                priority={false}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-300">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-400 transition-colors duration-300">
                  <span className="text-2xl text-white font-bold">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="transform transition-transform duration-300">
            <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-200 text-sm font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                {productCount} {productCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-white bg-black/40 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>
    </Link>
  );
};

export default CategoryCard;