export default function ProductsPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="py-4">
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Skeleton */}
          <div className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded mb-2 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}