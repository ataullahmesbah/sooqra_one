'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Types (unchanged)
interface ProductCategory {
    _id?: string;
    name?: string;
}

interface ProductPrice {
    currency: string;
    amount: number;
}

interface Product {
    _id: string;
    title?: string;
    category?: ProductCategory;
    product_code?: string;
    quantity?: number;
    prices?: ProductPrice[];
    owner?: string;
    slug?: string;
}

interface ApiResponse {
    message?: string;
    [key: string]: any;
}

export default function ModeratorAllProducts() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [searchTitle, setSearchTitle] = useState<string>('');
    const [searchCategory, setSearchCategory] = useState<string>('');
    const [searchProductCode, setSearchProductCode] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);

    const productsPerPage = 10;

    // Redirect if not moderator
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'moderator') {
            router.push('/unauthorized');
        }
    }, [status, session, router]);

    const fetchProducts = async () => {
        try {
            setIsRefreshing(true);
            setError(null);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: Failed to fetch products`);
            }

            const data: ApiResponse | Product[] = await res.json();
            let productList: Product[] = [];

            if (Array.isArray(data)) {
                productList = data;
            } else if (data?.data && Array.isArray(data.data)) {
                productList = data.data;
            } else if (data?.message && Array.isArray(data.message)) {
                productList = data.message;
            }

            setProducts(productList);
            setFilteredProducts(productList);
            setCurrentPage(1);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProducts();
        }
    }, [status]);

    // Search filtering
    useEffect(() => {
        const filtered = products.filter((p) => {
            const t = searchTitle.trim().toLowerCase();
            const c = searchCategory.trim().toLowerCase();
            const code = searchProductCode.trim().toLowerCase();

            return (
                (!t || p.title?.toLowerCase().includes(t)) &&
                (!c || p.category?.name?.toLowerCase().includes(c)) &&
                (!code || p.product_code?.toLowerCase().includes(code))
            );
        });

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [searchTitle, searchCategory, searchProductCode, products]);

    const handleClearSearch = () => {
        setSearchTitle('');
        setSearchCategory('');
        setSearchProductCode('');
    };

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getBDTPrice = (p: Product) =>
        p.prices?.find((pr) => pr.currency === 'BDT')?.amount
            ? `৳${p.prices.find((pr) => pr.currency === 'BDT')!.amount}`
            : 'N/A';

    const isModeratorProduct = (p: Product) => p.owner === session?.user?.name;

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
                    <p className="text-gray-400 text-lg">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
                <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full border border-slate-700 text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={fetchProducts}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-50"
                    >
                        {isRefreshing ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Refreshing...
                            </>
                        ) : (
                            'Try Again'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-slate-950 text-gray-100 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">All Products</h1>
                    <p className="mt-2 text-gray-400">View and manage the full product inventory</p>
                </div>

                {/* Search Card */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-6 mb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { value: searchTitle, set: setSearchTitle, placeholder: 'Search by title...' },
                            { value: searchCategory, set: setSearchCategory, placeholder: 'Search by category...' },
                            { value: searchProductCode, set: setSearchProductCode, placeholder: 'Search by code...' },
                        ].map(({ value, set, placeholder }, i) => (
                            <div key={i} className="relative">
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => set(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
                                />
                                {value && (
                                    <button
                                        onClick={() => set('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        <div className="flex gap-3">
                            <button
                                onClick={handleClearSearch}
                                disabled={!searchTitle && !searchCategory && !searchProductCode}
                                className="flex-1 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-gray-200 font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear
                            </button>
                            <button
                                onClick={fetchProducts}
                                disabled={isRefreshing}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-50 shadow-md shadow-indigo-900/30"
                            >
                                {isRefreshing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Refreshing
                                    </>
                                ) : (
                                    'Refresh'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-12 text-center">
                        <svg className="w-20 h-20 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-xl font-medium text-gray-300">
                            {searchTitle || searchCategory || searchProductCode
                                ? 'No matching products found'
                                : 'No products in the inventory yet'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
  <table className="w-full min-w-[900px] table-auto border-collapse">
    <thead>
      <tr className="bg-indigo-950/70 border-b border-slate-700">
        <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-300 w-[30%] min-w-[220px]">Title</th>
        <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-300 w-[14%]">Category</th>
        <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-300 w-[12%]">Code</th>
        <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-300 w-[8%]">Qty</th>
        <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-300 w-[10%]">Price (BDT)</th>
        <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-300 w-[12%]">Owner</th>
        <th className="px-6 py-5 text-left text-sm font-semibold text-indigo-300 w-[14%]">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-800">
      {currentProducts.map((product) => {
        const isOwn = isModeratorProduct(product);
                                       return (
          <tr key={product._id} className="hover:bg-indigo-950/30 transition-colors duration-150">
            <td className="px-6 py-5 text-gray-200">
              <div className="line-clamp-2 max-w-[320px] text-sm leading-5">
                {product.title || '—'}
              </div>
            </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-3 py-1 bg-slate-800 text-indigo-300 rounded-full text-sm whitespace-nowrap">
                                                        {product.category?.name || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 font-mono text-gray-400 whitespace-nowrap">
                                                    {product.product_code || '—'}
                                                </td>
                                                <td className="px-6 py-5 font-medium text-center">
                                                    {(() => {
                                                        const q = product.quantity ?? 0;
                                                        let color = 'text-red-400';
                                                        if (q > 10) color = 'text-emerald-400';
                                                        else if (q > 0) color = 'text-amber-400';
                                                        return <span className={color}>{q || '—'}</span>;
                                                    })()}
                                                </td>
                                                <td className="px-6 py-5 font-medium text-gray-200 whitespace-nowrap">
                                                    {getBDTPrice(product)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isOwn ? 'bg-emerald-950/70 text-emerald-300' : 'bg-red-950/70 text-red-300'
                                                            }`}
                                                    >
                                                        {product.owner || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-wrap gap-3 min-w-[140px]">
                                                        <Link
                                                            href={`/products/${product.slug || product._id}`}
                                                            target="_blank"
                                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 text-sm font-medium rounded-lg transition whitespace-nowrap"
                                                        >
                                                            View
                                                        </Link>

                                                        {isOwn ? (
                                                            <Link
                                                                href={`/moderator-dashboard/product/update-product/${product._id}`}
                                                                className="relative px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm shadow-indigo-900/40 whitespace-nowrap"
                                                                onMouseEnter={() => setHoveredButton(product._id)}
                                                                onMouseLeave={() => setHoveredButton(null)}
                                                            >
                                                                Edit
                                                                {hoveredButton === product._id && (
                                                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-xs text-gray-300 rounded border border-slate-700 whitespace-nowrap z-10">
                                                                        You can edit your own products
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        ) : (
                                                            <div className="relative">
                                                                <button
                                                                    disabled
                                                                    className="px-4 py-2 bg-slate-800 text-slate-500 text-sm font-medium rounded-lg cursor-not-allowed opacity-70 whitespace-nowrap"
                                                                    onMouseEnter={() => setHoveredButton(product._id)}
                                                                    onMouseLeave={() => setHoveredButton(null)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                {hoveredButton === product._id && (
                                                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-xs text-rose-300 rounded border border-slate-700 whitespace-nowrap z-10">
                                                                        Admin-created – cannot edit
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-5 bg-slate-900/80 border-t border-slate-800">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 text-sm">
                                    <div className="text-gray-400">
                                        Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredProducts.length)} of {filteredProducts.length}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            Prev
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === pageNum
                                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                                                            : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}