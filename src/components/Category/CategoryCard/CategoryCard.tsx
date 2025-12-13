// src/app/components/CategoryCard.tsx - SIMPLIFIED
'use client';

import Link from 'next/link';

const CategoryCard = ({ category }: { category: any }) => {
  // Safely extract properties with fallbacks
  const categoryId = category?._id || '';
  const categoryName = category?.name || 'Category';
  const productCount = category?.productCount || 0;
  
  // Get image from category or latest product
  const imageUrl = category?.image || 
                   category?.latestProduct?.mainImage || 
                   null;
  
  // Gradient colors for fallback
  const gradients = [
    'bg-gradient-to-br from-blue-500 to-purple-600',
    'bg-gradient-to-br from-green-500 to-teal-600',
    'bg-gradient-to-br from-red-500 to-pink-600',
    'bg-gradient-to-br from-yellow-500 to-orange-600',
    'bg-gradient-to-br from-indigo-500 to-blue-600',
    'bg-gradient-to-br from-pink-500 to-rose-600',
  ];
  
  // Select gradient based on category name
  const gradientIndex = categoryName.split('').reduce((acc: number, char: string) => {
    return acc + char.charCodeAt(0);
  }, 0) % gradients.length;
  
  const gradientBg = gradients[gradientIndex];
  
  return (
    <Link 
      href={`/categories/${categoryId}`}
      className="group block h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative h-full w-full">
        {/* Background Image or Gradient */}
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={category?.latestProduct?.mainImageAlt || categoryName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full ${gradientBg} flex items-center justify-center`}>
            <span className="text-white text-6xl font-bold opacity-40">
              {categoryName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Category Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{categoryName}</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
            <span className="transform group-hover:translate-x-2 transition-transform">
              →
            </span>
          </div>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>
    </Link>
  );
};

export default CategoryCard;