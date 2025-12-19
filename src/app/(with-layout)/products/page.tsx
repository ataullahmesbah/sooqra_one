

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

                {/* SEO Content Section */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <article>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {currentCategory
                        ? `About ${currentCategory.name} Products`
                        : 'About Our Product Collection'}
                    </h2>
                    
                    <div className="prose prose-gray max-w-none">
                      {currentCategory ? (
                        <>
                          <p className="text-gray-600 mb-4">
                            Welcome to our premium collection of {currentCategory.name.toLowerCase()} products. 
                            We offer the best selection of high-quality {currentCategory.name.toLowerCase()} items 
                            with competitive pricing and excellent customer service.
                          </p>
                          <p className="text-gray-600 mb-4">
                            Our {currentCategory.name.toLowerCase()} collection includes products from top brands, 
                            ensuring durability, reliability, and satisfaction. Each product is carefully 
                            selected to meet our quality standards.
                          </p>
                          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
                            Why Choose Our {currentCategory.name} Products?
                          </h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            <li>Premium quality materials and craftsmanship</li>
                            <li>Competitive pricing with regular discounts</li>
                            <li>Fast and reliable delivery options</li>
                            <li>Secure payment methods</li>
                            <li>Excellent customer support</li>
                            <li>Easy returns and warranty</li>
                          </ul>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-600 mb-4">
                            Welcome to our comprehensive product collection featuring premium items across 
                            various categories. We are committed to providing high-quality products with 
                            exceptional value and service.
                          </p>
                          <p className="text-gray-600 mb-4">
                            Our online store offers a wide range of products including electronics, fashion, 
                            home goods, and more. Each product is carefully selected to ensure quality, 
                            reliability, and customer satisfaction.
                          </p>
                          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
                            Why Shop With Us?
                          </h3>
                          <ul className="list-disc pl-5 text-gray-600 space-y-2">
                            <li>Extensive collection of premium products</li>
                            <li>Competitive pricing with regular promotions</li>
                            <li>Fast nationwide delivery</li>
                            <li>Secure and multiple payment options</li>
                            <li>24/7 customer support</li>
                            <li>Hassle-free returns policy</li>
                          </ul>
                        </>
                      )}
                    </div>

                    {/* FAQ Section for SEO */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-4">
                        <details className="group" itemScope itemType="https://schema.org/Question">
                          <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                            <strong className="text-gray-800" itemProp="name">
                              What is your delivery time?
                            </strong>
                            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform">
                              <path stroke="currentColor" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="p-4 text-gray-600" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                            <p itemProp="text">
                              We offer standard delivery within 3-5 business days and express delivery within 
                              1-2 business days. Delivery time may vary based on location and product availability.
                            </p>
                          </div>
                        </details>
                        
                        <details className="group" itemScope itemType="https://schema.org/Question">
                          <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                            <strong className="text-gray-800" itemProp="name">
                              What is your return policy?
                            </strong>
                            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform">
                              <path stroke="currentColor" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="p-4 text-gray-600" itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                            <p itemProp="text">
                              We offer a 30-day return policy for most products. Items must be in original 
                              condition with all tags attached. Please contact our customer support for 
                              return instructions.
                            </p>
                          </div>
                        </details>
                      </div>
                    </div>
                  </article>
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