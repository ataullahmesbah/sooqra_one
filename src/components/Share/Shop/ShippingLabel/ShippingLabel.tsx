'use client';
import { useRef, useState, useEffect, FC } from 'react';
import JsBarcode from 'jsbarcode';
import Image from 'next/image';

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    district?: string;
    thana?: string;
    notes?: string;
}

interface Product {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    size?: string;
    mainImage?: string;
}

interface Order {
    orderId: string;
    customerInfo: CustomerInfo;
    products: Product[];
    total: number;
    shippingCharge: number;
    discount: number;
    couponCode?: string;
    paymentMethod: string;
    createdAt: string;
    status: string;
}

interface ShippingLabelProps {
    order: Order;
    onClose: () => void;
}

const ShippingLabel: FC<ShippingLabelProps> = ({ order, onClose }) => {
    const labelRef = useRef<HTMLDivElement>(null);
    const barcodeRef = useRef<SVGSVGElement>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    // Calculate subtotal
    const subtotal = order.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

    // Generate barcode
    useEffect(() => {
        if (barcodeRef.current && order.orderId) {
            try {
                JsBarcode(barcodeRef.current, order.orderId, {
                    format: "CODE128",
                    width: 1.5,
                    height: 30,
                    displayValue: false,
                    margin: 5,
                    background: "#ffffff",
                    lineColor: "#000000"
                });
            } catch (error) {
                console.error('Barcode generation failed:', error);
            }
        }
    }, [order.orderId]);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handlePrint = () => {
        setIsPrinting(true);

        // Create print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shipping Label - ${order.orderId}</title>
                <meta charset="UTF-8">
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    @media print {
                        @page { 
                            margin: 0;
                            size: 100mm 150mm;
                        }
                        body { 
                            margin: 0;
                            padding: 2mm;
                            background: white;
                        }
                    }
                    
                    body {
                        margin: 0;
                        padding: 2mm;
                        font-family: 'Segoe UI', Arial, sans-serif;
                        background: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                    }
                    
                    .shipping-label {
                        width: 96mm;
                        min-height: 146mm;
                        background: white;
                        border: 1.5px solid #1e3a8a;
                        padding: 3mm;
                        margin: 0 auto;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    
                    /* Header */
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 2mm;
                        padding: 2mm;
                        border-bottom: 1.5px solid #2563eb;
                        margin-bottom: 2mm;
                    }
                    
                    .logo-container {
                        display: flex;
                        align-items: center;
                    }
                    
                    .logo-img {
                        width: 60px;
                        height: auto;
                        object-fit: contain;
                    }
                    
                    .auth-badge {
                        display: flex;
                        align-items: center;
                        gap: 1mm;
                        background: #f0f9ff;
                        padding: 1mm 2mm;
                        border-radius: 3mm;
                        border: 1px solid #2563eb;
                    }
                    
                    .auth-circle {
                        width: 4mm;
                        height: 4mm;
                        background: linear-gradient(135deg, #2563eb, #1e3a8a);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 2.5mm;
                        font-weight: bold;
                    }
                    
                    .auth-text {
                        font-family: 'Brush Script MT', cursive;
                        font-size: 3.5mm;
                        color: #2563eb;
                        font-weight: 600;
                    }
                    
                    /* Contact Info */
                    .contact-info {
                        font-size: 2.8mm;
                        color: #334155;
                        margin-bottom: 3mm;
                        padding: 1.5mm;
                        background: #f8fafc;
                        border-radius: 2mm;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .contact-item {
                        display: flex;
                        align-items: center;
                        gap: 1mm;
                    }
                    
                    /* Grid Layout */
                    .content-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 2mm;
                        margin-bottom: 3mm;
                    }
                    
                    .ship-to, .order-summary {
                        background: #f8fafc;
                        padding: 2mm;
                        border-radius: 2mm;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .section-title {
                        font-size: 3.2mm;
                        font-weight: 700;
                        color: #1e3a8a;
                        margin-bottom: 2mm;
                        border-bottom: 1px solid #cbd5e1;
                        padding-bottom: 0.5mm;
                    }
                    
                    .customer-details {
                        font-size: 2.8mm;
                        line-height: 1.4;
                    }
                    
                    .customer-name {
                        font-weight: 700;
                        font-size: 3.2mm;
                        color: #0f172a;
                    }
                    
                    .customer-phone {
                        color: #2563eb;
                        font-weight: 600;
                        margin: 0.5mm 0;
                    }
                    
                    .customer-address {
                        color: #475569;
                        margin-top: 0.5mm;
                    }
                    
                    /* Order Summary */
                    .product-list {
                        max-height: 40mm;
                        overflow-y: auto;
                    }
                    
                    .product-item {
                        font-size: 2.6mm;
                        margin-bottom: 1.5mm;
                        padding-bottom: 1mm;
                        border-bottom: 1px dashed #cbd5e1;
                    }
                    
                    .product-title {
                        font-weight: 600;
                        color: #0f172a;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 40mm;
                    }
                    
                    .product-details {
                        display: flex;
                        justify-content: space-between;
                        color: #475569;
                        margin-top: 0.5mm;
                    }
                    
                    /* Price Summary Section */
                    .price-summary {
                        margin-top: 2mm;
                        padding-top: 1mm;
                        border-top: 1px solid #94a3b8;
                    }
                    
                    .price-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 2.8mm;
                        padding: 0.5mm 0;
                    }
                    
                    .price-row.discount {
                        color: #059669;
                    }
                    
                    .price-row.total {
                        font-weight: 700;
                        font-size: 3.2mm;
                        color: #1e3a8a;
                        border-top: 2px solid #94a3b8;
                        margin-top: 1mm;
                        padding-top: 1mm;
                    }
                    
                    /* Barcode Section */
                    .barcode-section {
                        text-align: center;
                        margin: 3mm 0;
                        padding: 2mm;
                        background: white;
                        border: 1px solid #e2e8f0;
                        border-radius: 2mm;
                    }
                    
                    .barcode-container {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 1mm;
                    }
                    
                    .barcode-container svg {
                        max-width: 100%;
                        height: 35px;
                    }
                    
                    .order-id-display {
                        font-family: monospace;
                        font-size: 3.2mm;
                        font-weight: 600;
                        color: #1e293b;
                        letter-spacing: 0.3px;
                        margin: 1mm 0;
                    }
                    
                    .order-date {
                        font-size: 2.4mm;
                        color: #64748b;
                    }
                    
                    /* Footer */
                    .footer {
                        text-align: center;
                        font-size: 2.4mm;
                        color: #94a3b8;
                        margin-top: 2mm;
                        padding-top: 1mm;
                        border-top: 1px solid #e2e8f0;
                    }
                </style>
            </head>
            <body>
                <div class="shipping-label">
                    <!-- Header with Logo and Authorize -->
                    <div class="header">
                        <div class="logo-container">
                            <img src="${window.location.origin}/sooqra.svg" alt="Sooqra One" class="logo-img" />
                        </div>
                        <div class="auth-badge">
                            <div class="auth-circle">✓</div>
                            <div class="auth-text">Sooqra One Authorize</div>
                        </div>
                    </div>
                    
                    <!-- Contact Information -->
                    <div class="contact-info">
                        <span class="contact-item">📍 Dhaka, Bangladesh</span>
                        <span class="contact-item">📞 01571-083401</span>
                    </div>
                    
                    <!-- Main Content Grid -->
                    <div class="content-grid">
                        <!-- SHIP TO Section -->
                        <div class="ship-to">
                            <div class="section-title">📦 SHIP TO</div>
                            <div class="customer-details">
                                <div class="customer-name">${order.customerInfo.name}</div>
                                <div class="customer-phone">${order.customerInfo.phone}</div>
                                <div class="customer-address">
                                    ${order.customerInfo.address}<br>
                                    ${order.customerInfo.city ? order.customerInfo.city + ', ' : ''}
                                    ${order.customerInfo.thana ? order.customerInfo.thana + ', ' : ''}
                                    ${order.customerInfo.district ? order.customerInfo.district + ', ' : ''}
                                    ${order.customerInfo.postcode ? '- ' + order.customerInfo.postcode : ''}<br>
                                    ${order.customerInfo.country}
                                </div>
                            </div>
                        </div>
                        
                        <!-- ORDER SUMMARY Section -->
                        <div class="order-summary">
                            <div class="section-title">🛍️ ORDER SUMMARY</div>
                            <div class="product-list">
                                ${order.products.slice(0, 3).map(product => `
                                    <div class="product-item">
                                        <div class="product-title">${product.title.substring(0, 18)}${product.title.length > 18 ? '...' : ''}</div>
                                        <div class="product-details">
                                            <span>${product.size ? product.size + ' • ' : ''}x${product.quantity}</span>
                                            <span>৳${(product.price * product.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                `).join('')}
                                ${order.products.length > 3 ? `
                                    <div style="font-size: 2.4mm; color: #64748b; text-align: right; margin-top: 1mm;">
                                        +${order.products.length - 3} more items
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Price Summary - Subtotal, Discount, Shipping, Total -->
                            <div class="price-summary">
                                <div class="price-row">
                                    <span>Subtotal:</span>
                                    <span>৳${subtotal.toLocaleString()}</span>
                                </div>
                                
                                ${order.discount > 0 ? `
                                    <div class="price-row discount">
                                        <span>Discount:</span>
                                        <span>-৳${order.discount.toLocaleString()}</span>
                                    </div>
                                ` : ''}
                                
                                ${order.shippingCharge > 0 ? `
                                    <div class="price-row">
                                        <span>Shipping Charge:</span>
                                        <span>৳${order.shippingCharge.toLocaleString()}</span>
                                    </div>
                                ` : ''}
                                
                                <div class="price-row total">
                                    <span>Total:</span>
                                    <span>৳${order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Barcode Section -->
                    <div class="barcode-section">
                        <div class="barcode-container">
                            <svg id="barcode"></svg>
                        </div>
                        <div class="order-id-display">${order.orderId}</div>
                        <div class="order-date">Order Creation Date: ${formatDate(order.createdAt)}</div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        Authentic Product • Trusted Quality
                    </div>
                </div>
                
                <script>
                    // Generate barcode with small delay
                    setTimeout(function() {
                        try {
                            JsBarcode("#barcode", "${order.orderId}", {
                                format: "CODE128",
                                width: 1.5,
                                height: 30,
                                displayValue: false,
                                margin: 5,
                                background: "#ffffff",
                                lineColor: "#000000"
                            });
                        } catch (error) {
                            console.error('Barcode error:', error);
                        }
                    }, 100);
                    
                    // Auto print
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        }, 300);
                    };
                </script>
            </body>
            </html>
        `;

        // Open print window
        const printWindow = window.open('', '_blank', 'width=500,height=700,toolbar=0,location=0,menubar=0');

        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
        } else {
            // Fallback for popup blocker
            alert('Please allow popups for this site to print labels. Click OK to try again.');
            window.open(window.location.href, '_blank');
        }

        setIsPrinting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="bg-blue-900 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
                    <h2 className="font-bold text-sm">Shipping Label - {order.orderId}</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-blue-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-100 flex justify-center overflow-auto">
                    <div
                        ref={labelRef}
                        className="bg-white border-2 border-blue-900 shadow-lg"
                        style={{ width: '90mm', minHeight: '140mm' }}
                    >
                        {/* Header with Logo */}
                        <div className="flex items-center justify-between gap-2 p-2 border-b border-gray-300">
                            <Image
                                src="/sooqra.svg"
                                alt="Sooqra One"
                                width={80}
                                height={30}
                                className="object-contain"
                                priority
                            />
                            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-300">
                                <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow">
                                    ✓
                                </div>
                                <div className="font-signature text-[9px] text-blue-700" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                                    Sooqra One Authorize
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="text-[7px] bg-gray-50 p-1.5 flex justify-between border-b border-gray-200">
                            <span>📍 Dhaka, Bangladesh</span>
                            <span>📞 01571-083401</span>
                        </div>

                        {/* Grid: SHIP TO & ORDER SUMMARY */}
                        <div className="grid grid-cols-2 gap-1.5 p-1.5">
                            {/* Left - SHIP TO */}
                            <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                                <div className="text-[8px] font-bold text-blue-900 mb-1">📦 SHIP TO</div>
                                <div className="text-[7px] leading-tight">
                                    <div className="font-bold text-gray-900">{order.customerInfo.name}</div>
                                    <div className="text-blue-700 font-medium">{order.customerInfo.phone}</div>
                                    <div className="text-gray-600 mt-1">
                                        {order.customerInfo.address}<br />
                                        {order.customerInfo.city && `${order.customerInfo.city}, `}
                                        {order.customerInfo.thana && `${order.customerInfo.thana}, `}
                                        {order.customerInfo.district && `${order.customerInfo.district}, `}
                                        {order.customerInfo.postcode && `- ${order.customerInfo.postcode}`}<br />
                                        {order.customerInfo.country}
                                    </div>
                                </div>
                            </div>

                            {/* Right - ORDER SUMMARY */}
                            <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                                <div className="text-[8px] font-bold text-blue-900 mb-1">🛍️ ORDER SUMMARY</div>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {order.products.slice(0, 3).map((product, idx) => (
                                        <div key={idx} className="text-[7px] border-b border-gray-200 pb-0.5">
                                            <div className="font-medium truncate">{product.title.substring(0, 15)}</div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>{product.size && `${product.size} • `}x{product.quantity}</span>
                                                <span>৳{(product.price * product.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {order.products.length > 3 && (
                                        <div className="text-[6px] text-gray-500 text-right">+{order.products.length - 3} more</div>
                                    )}
                                </div>

                                {/* Price Summary - Preview */}
                                <div className="mt-1 pt-1 border-t border-gray-300">
                                    <div className="flex justify-between text-[7px]">
                                        <span>Subtotal:</span>
                                        <span>৳{subtotal.toLocaleString()}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-[7px] text-green-600">
                                            <span>Discount:</span>
                                            <span>-৳{order.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {order.shippingCharge > 0 && (
                                        <div className="flex justify-between text-[7px]">
                                            <span>Shipping:</span>
                                            <span>৳{order.shippingCharge.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-[8px] text-blue-900 border-t border-gray-300 mt-0.5 pt-0.5">
                                        <span>Total:</span>
                                        <span>৳{order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Barcode Section */}
                        <div className="text-center m-1.5 p-1.5 border border-gray-200 rounded bg-white">
                            <svg ref={barcodeRef} className="w-full h-8"></svg>
                            <div className="font-mono text-[9px] font-bold text-gray-800 mt-1">{order.orderId}</div>
                            <div className="text-[6px] text-gray-500">Order Creation Date: {formatDate(order.createdAt)}</div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-[6px] text-gray-400 border-t border-gray-200 mt-1 pt-1">
                            Authentic Product • Trusted Quality
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-gray-50 rounded-b-lg flex gap-2">
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1 font-medium"
                    >
                        {isPrinting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>🖨️ Print Label</>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingLabel;