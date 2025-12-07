// src/app/components/ShippingLabel/ShippingLabel.tsx
'use client';
import { useRef, useState, useEffect, FC } from 'react';

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
}

interface Product {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    size?: string;
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
    const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null);

    // Barcode generation function
    useEffect(() => {
        const generateBarcode = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = 400;
                canvas.height = 60;

                // White background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Barcode settings
                const data = order.orderId;
                const barWidth = 1.5;
                const barHeight = 50;
                const quietZone = 30;
                const startX = quietZone;
                const startY = 5;

                // Simple barcode pattern
                ctx.fillStyle = '#000000';
                let x = startX;

                for (let i = 0; i < data.length; i++) {
                    const charCode = data.charCodeAt(i);
                    const binaryPattern = charCode.toString(2).padStart(8, '0');

                    for (let j = 0; j < binaryPattern.length; j++) {
                        if (binaryPattern[j] === '1') {
                            ctx.fillRect(x, startY, barWidth, barHeight);
                        }
                        x += barWidth;
                    }

                    // Add gap between characters
                    x += 2;
                }

                setBarcodeDataUrl(canvas.toDataURL());
            } catch (error) {
                console.error('Barcode generation failed:', error);
                setBarcodeDataUrl(null);
            }
        };

        generateBarcode();
    }, [order.orderId]);

    const handlePrint = () => {
        if (!barcodeDataUrl) {
            alert('Barcode generation failed. Please try again.');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shipping Label - ${order.orderId}</title>
                <style>
                    @media print {
                        @page { 
                            margin: 0; 
                            size: 100mm 150mm;
                        }
                        body { 
                            margin: 0; 
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            width: 100mm;
                            height: 150mm;
                        }
                    }
                    
                    .shipping-label {
                        width: 100mm;
                        height: 150mm;
                        padding: 4mm;
                        border: 2px solid #1a365d;
                        background: white;
                        color: #1a365d;
                        font-size: 9px;
                        line-height: 1.2;
                        font-family: 'Segoe UI', Arial, sans-serif;
                    }
                    
                    .header { 
                        text-align: center; 
                        margin-bottom: 2mm;
                        padding-bottom: 2mm;
                        border-bottom: 3px solid #2b6cb0;
                        background: linear-gradient(135deg, #2b6cb0, #2c5282);
                        margin: -4mm -4mm 2mm -4mm;
                        padding: 3mm;
                        color: white;
                    }
                    
                    .company-name { 
                        font-size: 16px; 
                        font-weight: 800; 
                        margin-bottom: 1mm;
                        letter-spacing: 0.5px;
                    }
                    
                    .order-id { 
                        font-size: 10px; 
                        font-weight: 600;
                        margin-top: 1mm;
                        background: rgba(255,255,255,0.15);
                        padding: 1mm 2mm;
                        border-radius: 3px;
                        display: inline-block;
                    }
                    
                    .barcode-container { 
                        text-align: center; 
                        margin: 1mm 0 2mm 0;
                        padding: 1mm;
                        background: #f7fafc;
                        border-radius: 4px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .barcode {
                        max-width: 100%;
                        height: 20mm;
                        display: block;
                        margin: 0 auto;
                    }
                </style>
            </head>
            <body>
                <div class="shipping-label">
                    <div class="header">
                        <div class="company-name">SOOQRA ONE</div>
                        <div class="order-id">ORDER #${order.orderId}</div>
                    </div>
                    
                    <div class="barcode-container">
                        <img class="barcode" src="${barcodeDataUrl}" alt="Barcode" />
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Shipping Label</h2>
                        <p className="text-gray-600">Order: {order.orderId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Preview */}
                <div className="border-2 border-gray-300 rounded-lg p-4 mb-6 bg-white">
                    <div
                        ref={labelRef}
                        className="bg-white p-4 border border-gray-200 rounded"
                        style={{ width: '100mm', minHeight: '150mm' }}
                    >
                        {/* Label content */}
                        {barcodeDataUrl && (
                            <img src={barcodeDataUrl} alt="Barcode" className="w-full" />
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Print Label
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingLabel;