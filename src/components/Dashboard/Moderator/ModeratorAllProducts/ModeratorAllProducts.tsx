'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Types
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
    const productsPerPage = 10;

    // Redirect if not moderator
    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user.role !== 'moderator') {
            router.push('/unauthorized');
        }
    }, [session, status, router]);

    const fetchProducts = async () => {
        try {
            setIsRefreshing(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/products`, {
                cache: 'no-store'
            });

            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}: Failed to fetch products`);
            }

            const data: ApiResponse | Product[] = await res.json();

            let productList: Product[] = [];

            if (Array.isArray(data)) {
                productList = data as Product[];
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.message)) {
                    productList = data.message as Product[];
                } else if (data.data && Array.isArray(data.data)) {
                    productList = data.data as Product[];
                }
            }

            setProducts(productList);
            setFilteredProducts(productList);
            setError(null);
            setCurrentPage(1);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const filtered = products.filter((product) => {
            const titleMatch = product.title?.toLowerCase().includes(searchTitle.toLowerCase().trim()) ?? false;
            const categoryMatch = searchCategory
                ? product.category?.name?.toLowerCase().includes(searchCategory.toLowerCase().trim()) ?? false
                : true;
            const codeMatch = searchProductCode
                ? product.product_code?.toLowerCase().includes(searchProductCode.toLowerCase().trim()) ?? false
                : true;
            return titleMatch && categoryMatch && codeMatch;
        });
        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [searchTitle, searchCategory, searchProductCode, products]);

    const handleClearSearch = () => {
        setSearchTitle('');
        setSearchCategory('');
        setSearchProductCode('');
    };

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSearchTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTitle(e.target.value);
    };

    const handleSearchCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchCategory(e.target.value);
    };

    const handleSearchCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchProductCode(e.target.value);
    };

    const getBDTPrice = (product: Product): string => {
        const bdtPrice = product.prices?.find((p) => p.currency === 'BDT')?.amount;
        return bdtPrice ? `৳${bdtPrice}` : 'N/A';
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto py-8 px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
                        <div className="animate-pulse h-10 w-10 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="animate-pulse h-96 w-full bg-orange-100 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto py-8 px-4">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800">All Products</h1>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchProducts}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Refreshing...
                            </>
                        ) : (
                            'Retry'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">All Products</h1>
                    <p className="text-gray-600">Manage and view all products in inventory</p>
                </div>

                {/* Search Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTitle}
                                onChange={handleSearchTitleChange}
                                placeholder="Search by title..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {searchTitle && (
                                <button
                                    onClick={() => setSearchTitle('')}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchCategory}
                                onChange={handleSearchCategoryChange}
                                placeholder="Search by category..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {searchCategory && (
                                <button
                                    onClick={() => setSearchCategory('')}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchProductCode}
                                onChange={handleSearchCodeChange}
                                placeholder="Search by product code..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {searchProductCode && (
                                <button
                                    onClick={() => setSearchProductCode('')}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!searchTitle && !searchCategory && !searchProductCode}
                            >
                                Clear All
                            </button>
                            <button
                                onClick={fetchProducts}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                        <div className="flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                            </svg>
                            <p className="text-gray-600 text-lg font-medium">
                                {searchTitle || searchCategory || searchProductCode
                                    ? 'No products found. Try adjusting your search.'
                                    : 'No products available.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Products Table */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-orange-600 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Title</th>
                                            <th className="px-6 py-4 text-left font-semibold">Category</th>
                                            <th className="px-6 py-4 text-left font-semibold">Code</th>
                                            <th className="px-6 py-4 text-left font-semibold">Quantity</th>
                                            <th className="px-6 py-4 text-left font-semibold">Price (BDT)</th>
                                            <th className="px-6 py-4 text-left font-semibold">Owner</th>
                                            <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-orange-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-900">{product.title || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                                        {product.category?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-gray-600">{product.product_code || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-medium ${(product.quantity ?? 0) > 10
                                                            ? 'text-green-600'
                                                            : (product.quantity ?? 0) > 0
                                                                ? 'text-yellow-600'
                                                                : 'text-red-600'
                                                        }`}>
                                                        {product.quantity ?? 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {getBDTPrice(product)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {product.owner || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-3">
                                                        <Link
                                                            href={`/products/${product.slug || product._id}`}
                                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                                            target="_blank"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/moderator-dashboard/product/update-product/${product._id}`}
                                                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                                                        >
                                                            Edit
                                                        </Link>
                                                        {/* ✅ Delete Button Removed - Moderators cannot delete */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === pageNum
                                                                    ? 'bg-orange-600 text-white'
                                                                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}