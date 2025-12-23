

// src/app/products/page.tsx

import { getCategories, getProducts, getCategoryBySlug } from '@/src/lib/data';
import CategorySidebar from '@/src/components/products/CategorySidebar/CategorySidebar';
import ProductList from '@/src/components/products/ProductList/ProductList';
import BreadcrumbNavigation from '@/src/components/products/BreadcrumbNavigation/BreadcrumbNavigation';
import ProductsSchema from '@/src/components/SEO/ProductsSchema';






// Site configuration
const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sooqraone.com',
  name: 'Your E-commerce Store',
  logo: 'https://sooqraone.com/logo.png',
  twitterHandle: '@sooqraone',
  facebookPage: 'https://facebook.com/yourstore',
  instagramPage: 'https://instagram.com/yourstore',
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

// Generate dynamic metadata
export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category || '';

  // Fetch category data for metadata
  let currentCategory = null;
  if (categorySlug) {
    try {
      currentCategory = await getCategoryBySlug(categorySlug);
    } catch (error) {
      console.error('Error fetching category for metadata:', error);
    }
  }

  const title = currentCategory
    ? `${currentCategory.name} Products - Buy Premium ${currentCategory.name} Online | ${SITE_CONFIG.name}`
    : `Products - Shop Premium Products Online | ${SITE_CONFIG.name}`;

  const description = currentCategory
    ? `Buy premium ${currentCategory.name.toLowerCase()} products online. Best quality ${currentCategory.name.toLowerCase()} collection with secure payment and fast delivery.`
    : 'Shop our premium collection of products across all categories. Best quality, secure payment, fast delivery, and excellent customer service.';

  const canonicalUrl = categorySlug
    ? `${SITE_CONFIG.url}/products?category=${categorySlug}`
    : `${SITE_CONFIG.url}/products`;

  // Fetch categories for keywords
  const categories = await getCategories();
  const categoryNames = categories.map(cat => cat.name).join(', ');

  const keywords = currentCategory
    ? `${currentCategory.name}, buy ${currentCategory.name} online, ${currentCategory.name} products, ${currentCategory.name.toLowerCase()} collection, online shopping`
    : `online shopping, ecommerce, products, ${categoryNames}, buy online, shopping`;

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE_CONFIG.name }],
    publisher: SITE_CONFIG.name,
    creator: SITE_CONFIG.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: currentCategory?.image || '/default-og-image.jpg',
          width: 1200,
          height: 630,
          alt: currentCategory ? `${currentCategory.name} Products` : 'Products Collection',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: SITE_CONFIG.twitterHandle,
      images: [currentCategory?.image || '/default-twitter-image.jpg'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
    category: 'e-commerce',
  };
}

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  try {
    // Get category from search paramsF
    const params = await searchParams;
    const categorySlug = params.category || '';

    // Fetch data in parallel
    const [categories, products, currentCategory] = await Promise.all([
      getCategories(),
      getProducts(categorySlug),
      categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null),
    ]);

    return (
      <>
        {/* Schema Markup */}
        <ProductsSchema
          currentCategory={currentCategory}
          categories={categories}
          products={products}
          categorySlug={categorySlug}
          siteUrl={SITE_CONFIG.url}
          siteName={SITE_CONFIG.name}
          siteLogo={SITE_CONFIG.logo}
        />

        {/* Structured Data for Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: currentCategory ? `${currentCategory.name} Products` : 'All Products',
              description: currentCategory
                ? `Browse ${currentCategory.name} products`
                : 'Browse all products',
              url: `${SITE_CONFIG.url}/products${categorySlug ? `?category=${categorySlug}` : ''}`,
              isPartOf: {
                '@type': 'WebSite',
                url: SITE_CONFIG.url,
                name: SITE_CONFIG.name,
              },
            }),
          }}
        />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Structured Data Breadcrumb */}
          <nav
            aria-label="breadcrumb"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
            className="bg-white border-b border-gray-200"
          >
            <div className="container mx-auto px-4 py-12">
              <BreadcrumbNavigation
                currentCategory={currentCategory}
                categorySlug={categorySlug}
              />

              {/* Page Title with Schema */}
              <div className="mt-4">
                <h1
                  itemProp="name"
                  className="text-2xl md:text-3xl font-bold text-gray-900"
                >
                  {currentCategory ? currentCategory.name : 'All Products'}
                </h1>
                <p
                  itemProp="description"
                  className="text-gray-600 mt-1 text-lg"
                >
                  {currentCategory
                    ? `Browse our premium collection of ${currentCategory.name.toLowerCase()} products`
                    : 'Discover our curated collection of premium products across all categories'}
                </p>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Sidebar - Categories */}
              <aside
                aria-label="Product categories"
                className="lg:w-1/4"
                itemScope
                itemType="https://schema.org/WPSideBar"
              >
                <CategorySidebar
                  categories={categories}
                  currentCategorySlug={categorySlug}
                />
              </aside>

              {/* Right Content - Products */}
              <main className="lg:w-3/4">
                <div
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"

                  itemType="https://schema.org/ItemList"
                  itemScope itemID={`${SITE_CONFIG.url}/products${categorySlug ? `?category=${categorySlug}` : ''}`}
                >
                  {/* Products Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          <span itemProp="name">
                            {currentCategory
                              ? `${currentCategory.name} Products`
                              : 'All Products'}
                          </span>
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                          <span itemProp="numberOfItems">{products.length}</span> products available
                        </p>
                      </div>

                      {/* Category Indicator */}
                      {currentCategory && (
                        <div
                          className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          itemProp="category"
                          itemScope
                          itemType="https://schema.org/Thing"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Currently viewing: <span itemProp="name">{currentCategory.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="p-6">
                    <ProductList
                      initialProducts={products}
                      categorySlug={categorySlug}
                    />
                  </div>

                </div>


              </main>
            </div>
          </div>

          {/* Hidden SEO Text (for search engines only) */}
          <div className="hidden" aria-hidden="true">
            <h2>Product Categories Keywords</h2>
            <p>
              {categories.map(cat => cat.name).join(', ')} products available for purchase.
              Shop online for best deals on {categories.slice(0, 5).map(cat => cat.name.toLowerCase()).join(', ')}
              and more categories. Best prices, fast shipping, secure payment.
            </p>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading products page:', error);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">Unable to load products. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
};

export default ProductsPage;