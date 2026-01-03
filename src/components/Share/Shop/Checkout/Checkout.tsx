'use client';
'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';
import CheckoutPayment from '../CheckoutPayment/CheckoutPayment';


// Interface Definitions
interface CartItem {
    _id: string;
    title: string;
    quantity: number;
    price: number;
    mainImage: string;
    mainImageAlt?: string;
    currency: string;
    size?: string | null;
}

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    district: string;
    thana: string;
    notes: string;
}

interface ValidationErrors {
    email: string;
    phone: string;
}

interface DistrictsThanas {
    [key: string]: string[];
}

interface ShippingCharges {
    'Dhaka': number;
    'Other-Districts': number;
}

interface AppliedCoupon {
    code: string;
    type: 'product' | 'global';
    productId?: string;
    discountPercentage?: number;
    discountAmount?: number;
    minCartTotal?: number;
}

interface OrderData {
    orderId: string;
    products: Array<{
        productId: string;
        title: string;
        quantity: number;
        price: number;
        mainImage: string | null;
        size: string | null;
    }>;
    customerInfo: CustomerInfo & {
        bkashNumber?: string;
        transactionId?: string;
    };
    paymentMethod: string;
    status: string;
    total: number;
    discount: number;
    shippingCharge: number;
    couponCode: string | null;
    acceptedTerms: boolean;
    termsAcceptedAt: string;
}

interface ToastType {
    success: string;
    error: string;
    info: string;
}

interface User {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
}

interface Session {
    user?: User;
}


export default function Checkout() {
    const { data: session, status } = useSession(); // Add this
    const [isCouponOpen, setIsCouponOpen] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
        email: '',
        phone: ''
    });
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [emailTouched, setEmailTouched] = useState<boolean>(false);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<string>('cod');
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        country: 'Bangladesh',
        district: '',
        thana: '',
        notes: '',
    });
    const [couponCode, setCouponCode] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);
    const [couponError, setCouponError] = useState<string>('');
    const [shippingCharge, setShippingCharge] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [districtsThanas, setDistrictsThanas] = useState<DistrictsThanas>({});
    const router = useRouter();
    const [shippingCharges, setShippingCharges] = useState<ShippingCharges>({
        'Dhaka': 0,
        'Other-Districts': 0
    });
    const [userId, setUserId] = useState<string>(''); // Change this
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
    const [validatingCart, setValidatingCart] = useState<boolean>(false);

    // Payment states
    const [bkashNumber, setBkashNumber] = useState<string>('');
    const [transactionId, setTransactionId] = useState<string>('');
    const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
    const [orderData, setOrderData] = useState<OrderData | null>(null);

    // Add this useEffect to get user info if logged in
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            // If user is logged in, pre-fill their info
            setCustomerInfo(prev => ({
                ...prev,
                name: session.user?.name || '',
                email: session.user?.email || '',
                phone: (session.user as any)?.phone || '',
            }));

            // Set userId for logged in user
            setUserId((session.user as any)?.id || '');
        } else {
            // If guest, reset userId
            setUserId('');
        }
    }, [session, status]);

    const toggleCoupon = (): void => {
        setIsCouponOpen(!isCouponOpen);
    };

    // Email validation effect
    useEffect(() => {
        if (emailTouched && customerInfo.email) {
            if (!validateEmail(customerInfo.email)) {
                setValidationErrors(prev => ({
                    ...prev,
                    email: 'Please enter a valid email address'
                }));
            } else {
                setValidationErrors(prev => ({ ...prev, email: '' }));
            }
        }
        validateForm();
    }, [customerInfo.email, emailTouched]);

    // Custom Toast Function
    const showCustomToast = (message: string, type: keyof ToastType = 'info'): void => {
        const existingToast = document.querySelector('.custom-toast-checkout');
        if (existingToast) {
            document.body.removeChild(existingToast);
        }

        const toastElement = document.createElement('div');
        toastElement.className = `custom-toast-checkout custom-toast-${type}`;

        const icons: ToastType = {
            success: `
        <svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      `,
            error: `
        <svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      `,
            info: `
        <svg xmlns="http://www.w3.org/2000/svg" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      `
        };

        toastElement.innerHTML = `
      <div class="toast-content">
        ${icons[type]}
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;

        document.body.appendChild(toastElement);

        setTimeout(() => {
            toastElement.classList.add('show');
        }, 10);

        setTimeout(() => {
            toastElement.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toastElement)) {
                    document.body.removeChild(toastElement);
                }
            }, 300);
        }, 4000);
    };

    // Initial data fetch
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
                setCart(storedCart);

                const districtsResponse = await axios.get('/api/products/districts-thanas');
                setDistrictsThanas(districtsResponse.data);

                const shippingResponse = await axios.get('/api/products/shipping-charges');
                const chargeMap: ShippingCharges = {
                    'Dhaka': 0,
                    'Other-Districts': 0
                };

                shippingResponse.data.forEach((c: { type: string; charge: number }) => {
                    if (c.type === 'Dhaka' || c.type === 'Other-Districts') {
                        chargeMap[c.type as keyof ShippingCharges] = c.charge || 0;
                    }
                });

                setShippingCharges(chargeMap);


                if (customerInfo.district) {
                    const isDhaka = customerInfo.district.toLowerCase().includes('dhaka');
                    const charge = isDhaka ? chargeMap['Dhaka'] : chargeMap['Other-Districts'];
                    setShippingCharge(Number.isFinite(charge) ? charge : 0);
                }
            } catch (error) {
                setError('Failed to load checkout data. Please refresh the page.');
                showCustomToast('Failed to load checkout data. Please refresh the page.', 'error');
            }
        };
        fetchData();
    }, []);

    // Cart validation function 
    const validateCart = async (): Promise<boolean> => {
        setValidatingCart(true);
        try {
            const validationPromises = cart.map(async (item) => {
                try {
                    const response = await axios.post('/api/products/cart/validate', {
                        productId: item._id,
                        quantity: item.quantity,
                        size: item.size || null
                    });
                    return { ...response.data, productId: item._id, size: item.size || null, title: item.title };
                } catch (error: any) {
                    return {
                        valid: false,
                        message: error.response?.data?.message || 'Error validating item',
                        productId: item._id,
                        size: item.size || null,
                        title: item.title
                    };
                }
            });

            const results = await Promise.all(validationPromises);
            const invalidItems = results.filter(result => !result.valid);

            if (invalidItems.length > 0) {
                const updatedCart = cart.map(item => {
                    const validation = results.find(r => r.productId === item._id && (r.size || null) === (item.size || null));
                    if (!validation?.valid && (validation as any)?.availableQuantity !== undefined) {
                        showCustomToast(
                            `Adjusted quantity to ${(validation as any).availableQuantity} for ${item.title}${item.size ? ` (size: ${item.size})` : ''}`,
                            'info'
                        );
                        // Type assertion ব্যবহার করুন
                        return {
                            ...item,
                            quantity: (validation as any).availableQuantity,
                            size: (item.size || null) as string | undefined // এখানে type assertion
                        } as CartItem;
                    }
                    return item;
                });

                setCart(updatedCart);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                window.dispatchEvent(new Event('cartUpdated'));

                invalidItems.forEach(result => {
                    showCustomToast(
                        `${result.title || 'Product'}: ${result.message}${result.size ? ` (size: ${result.size})` : ''}`,
                        'error'
                    );
                });

                return false;
            }

            return true;
        } catch (error) {
            showCustomToast('Failed to validate cart items', 'error');
            return false;
        } finally {
            setValidatingCart(false);
        }
    };

    // Helper functions
    const getBDTPrice = (item: CartItem): number => {
        if (!item || !item.price || !item.currency) return 0;
        if (item.currency === 'BDT') return item.price;
        return item.price * (item.currency === 'USD' ? 120 : 130);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Form handlers
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setValidationErrors(prev => ({ ...prev, [name]: '' }));

        if (name === 'email') {
            setEmailTouched(true);
            if (value && !validateEmail(value)) {
                setValidationErrors(prev => ({
                    ...prev,
                    email: 'Please enter a valid email address'
                }));
            }
        }

        if (name === 'district') {
            setCustomerInfo((prev) => ({ ...prev, thana: '', district: value }));

            // ✅ নতুন shipping charge logic
            const isDhaka = value.toLowerCase().includes('dhaka');
            const charge = isDhaka ? shippingCharges['Dhaka'] : shippingCharges['Other-Districts'];
            setShippingCharge(Number.isFinite(charge) ? charge : 0);
        } else {
            setCustomerInfo((prev) => ({ ...prev, [name]: value }));
        }

        validateForm();
    };

    const validateForm = (): boolean => {
        const errors: ValidationErrors = { email: '', phone: '' };

        // Email validation
        if (customerInfo.email && !validateEmail(customerInfo.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (customerInfo.country === 'Bangladesh' && customerInfo.phone) {
            if (customerInfo.phone.length !== 11 || !/^01[3-9]/.test(customerInfo.phone)) {
                errors.phone = 'Enter valid 11-digit number (01XXXXXXXXX)';
            }
        }

        setValidationErrors(errors);

        const isValid =
            !!customerInfo.name &&
            !!customerInfo.email &&
            validateEmail(customerInfo.email) &&
            !!customerInfo.phone &&
            !!customerInfo.address &&
            Object.keys(errors).every(key => !errors[key as keyof ValidationErrors]);

        setIsFormValid(isValid);
        return isValid;
    };

    const getStorablePhoneNumber = (phone: string): string => {
        if (!phone) return '';
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
            return `880${cleanPhone.slice(1)}`;
        }
        return cleanPhone;
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
        setCustomerInfo((prev) => ({ ...prev, phone: value }));
        setValidationErrors(prev => ({ ...prev, phone: '' }));
        validateForm();
    };

    const handleQuantityChange = async (productId: string, newQuantity: number): Promise<void> => {
        if (newQuantity < 1 || !productId) return;

        try {
            const response = await axios.get(`/api/products/${productId}`);
            const product = response.data;

            if (newQuantity > product.quantity) {
                showCustomToast(`Only ${product.quantity} units available for ${product.title}`, 'error');
                return;
            }

            if (newQuantity > 3) {
                showCustomToast(`Maximum 3 units allowed for ${product.title}`, 'error');
                return;
            }

            const updatedCart = cart.map(item =>
                item._id === productId ? { ...item, quantity: newQuantity } : item
            );
            setCart(updatedCart);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            window.dispatchEvent(new Event('cartUpdated'));

            showCustomToast(`Quantity updated to ${newQuantity} for ${product.title}`, 'success');

            if (appliedCoupon) {
                if (appliedCoupon.type === 'product') {
                    const cartItem = updatedCart.find(item => item._id === appliedCoupon.productId);
                    if (cartItem) {
                        const discountAmount = (getBDTPrice(cartItem) * (appliedCoupon.discountPercentage || 0)) / 100;
                        setDiscount(Number.isFinite(discountAmount) ? discountAmount : 0);
                    } else {
                        setDiscount(0);
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setCouponError('Coupon no longer applicable.');
                        showCustomToast('Coupon no longer applicable.', 'error');
                    }
                } else if (appliedCoupon.type === 'global') {
                    const subtotal = updatedCart.reduce((sum, item) => sum + getBDTPrice(item) * (item.quantity || 1), 0);
                    if (subtotal >= (appliedCoupon.minCartTotal || 0)) {
                        setDiscount(Number.isFinite(appliedCoupon.discountAmount) ? appliedCoupon.discountAmount! : 0);
                    } else {
                        setDiscount(0);
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setCouponError(`Cart total must be at least ৳${appliedCoupon.minCartTotal}`);
                        showCustomToast(`Cart total must be at least ৳${appliedCoupon.minCartTotal}`, 'error');
                    }
                }
            }
        } catch (error) {
            showCustomToast('Error checking product availability', 'error');
        }
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + getBDTPrice(item) * (item.quantity || 1), 0);
    const payableAmount = subtotal - discount + (
        customerInfo.country === 'Bangladesh' &&
            (paymentMethod === 'cod' || paymentMethod === 'bkash' || paymentMethod === 'pay_first')
            ? (Number.isFinite(shippingCharge) ? shippingCharge : 0)
            : 0
    );

    // Coupon handling
    const handleCouponApply = async (): Promise<void> => {
        setCouponError('');
        setDiscount(0);
        setAppliedCoupon(null);
        try {
            const productIds = cart.map(item => item._id).filter(id => id);
            if (!productIds.length) {
                setCouponError('No valid products in cart.');
                showCustomToast('No valid products in cart.', 'error');
                return;
            }
            const response = await axios.post('/api/products/coupons/validate', {
                code: couponCode,
                productIds,
                userId,
                cartTotal: subtotal,
                email: customerInfo.email,
                phone: customerInfo.phone,
            });
            if (response.data.valid) {
                if (response.data.type === 'product') {
                    const cartItem = cart.find(item => item._id === response.data.productId?.toString());
                    if (!cartItem) {
                        setCouponError('Coupon not applicable to cart items.');
                        showCustomToast('Coupon not applicable to cart items.', 'error');
                        return;
                    }
                    const discountAmount = (getBDTPrice(cartItem) * response.data.discountPercentage) / 100;
                    setDiscount(Number.isFinite(discountAmount) ? discountAmount : 0);
                    setAppliedCoupon({
                        code: couponCode,
                        type: 'product',
                        productId: response.data.productId,
                        discountPercentage: response.data.discountPercentage,
                    });
                    showCustomToast(`Coupon ${couponCode} applied successfully!`, 'success');
                } else if (response.data.type === 'global') {
                    const discountAmount = response.data.discountAmount;
                    setDiscount(Number.isFinite(discountAmount) ? discountAmount : 0);
                    setAppliedCoupon({
                        code: couponCode,
                        type: 'global',
                        discountAmount,
                        minCartTotal: response.data.minCartTotal || 0,
                    });
                    showCustomToast(`Coupon ${couponCode} applied successfully!`, 'success');
                }
            } else {
                setCouponError(response.data.message || 'Invalid coupon code.');
                showCustomToast(response.data.message || 'Invalid coupon code.', 'error');
            }
        } catch (err) {
            setCouponError('Error applying coupon. Please try again.');
            showCustomToast('Error applying coupon. Please try again.', 'error');
        }
    };

    const generateOrderId = (): string => {
        return 'ORDER_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const handleCheckout = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (customerInfo.country === 'Bangladesh') {
            if (!customerInfo.phone || customerInfo.phone.length !== 11 || !/^01[3-9]/.test(customerInfo.phone)) {
                setError('Please enter a valid 11-digit Bangladesh phone number (01XXXXXXXXX)');
                setLoading(false);
                return;
            }
        }

        if (!acceptedTerms) {
            setError('Please accept the Terms & Conditions to proceed.');
            showCustomToast('Please accept the Terms & Conditions to proceed.', 'error');
            setLoading(false);
            return;
        }

        if (paymentMethod === 'bkash') {
            if (!bkashNumber || !transactionId) {
                setError('Please provide both Bkash number and Transaction ID.');
                showCustomToast('Please provide both Bkash number and Transaction ID.', 'error');
                setLoading(false);
                return;
            }
            if (bkashNumber.length !== 11) {
                setError('Please enter a valid 11-digit Bkash number.');
                showCustomToast('Please enter a valid 11-digit Bkash number.', 'error');
                setLoading(false);
                return;
            }
        }

        // Cart validation
        const isCartValid = await validateCart();
        if (!isCartValid) {
            setLoading(false);
            showCustomToast('Some items in your cart are invalid. Please check your cart.', 'error');
            return;
        }

        // Form validation
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
            setError('Please fill in all required fields.');
            showCustomToast('Please fill in all required fields.', 'error');
            setLoading(false);
            return;
        }

        // District and thana validation for Bangladesh
        if ((paymentMethod === 'cod' || paymentMethod === 'bkash') &&
            customerInfo.country === 'Bangladesh' &&
            (!customerInfo.district || !customerInfo.thana)) {
            setError('Please select district and thana for delivery.');
            showCustomToast('Please select district and thana for delivery.', 'error');
            setLoading(false);
            return;
        }

        if (!cart.length) {
            setError('Your cart is empty.');
            showCustomToast('Your cart is empty.', 'error');
            setLoading(false);
            return;
        }

        // Create order data object
        const orderData = {
            orderId: generateOrderId(),
            products: cart.map((item) => ({
                productId: item._id,
                title: item.title || 'Unknown Product',
                quantity: item.quantity || 1,
                price: getBDTPrice(item),
                mainImage: item.mainImage || null,
                size: item.size || null
            })),
            customerInfo: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: getStorablePhoneNumber(customerInfo.phone),
                address: customerInfo.address,
                notes: customerInfo.notes || '',
                city: customerInfo.city || '',
                postcode: customerInfo.postcode || '',
                country: customerInfo.country || 'Bangladesh',
                district: customerInfo.district || '',
                thana: customerInfo.thana || '',
                ...(paymentMethod === 'bkash' && {
                    bkashNumber: bkashNumber || '',
                    transactionId: transactionId || ''
                })
            },
            paymentMethod,
            status: paymentMethod === 'cod' || paymentMethod === 'bkash' ? 'pending' : 'pending_payment',
            total: Number.isFinite(payableAmount) ? payableAmount : 0,
            discount: discount || 0,
            shippingCharge: ((paymentMethod === 'cod' || paymentMethod === 'bkash') &&
                customerInfo.country === 'Bangladesh') ?
                (Number.isFinite(shippingCharge) ? shippingCharge : 0) : 0,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            acceptedTerms: true,
            termsAcceptedAt: new Date().toISOString(),
            userId: userId || null,
            userEmail: customerInfo.email,
            userPhone: getStorablePhoneNumber(customerInfo.phone)
        };

        setOrderData(orderData);

        console.log('Submitting order data:', {
            orderId: orderData.orderId,
            productCount: orderData.products.length,
            paymentMethod: orderData.paymentMethod,
            total: orderData.total,
            userId: userId || 'guest'
        });

        // Debug: Check notes field
        console.log('Notes in order data:', orderData.customerInfo.notes);
        console.log('Full customer info:', orderData.customerInfo);

        try {
            if (paymentMethod === 'cod' || paymentMethod === 'bkash') {
                // Add userId to order data
                const orderDataWithUser = {
                    ...orderData,
                    userId: userId || null,
                    userEmail: customerInfo.email,
                    userPhone: getStorablePhoneNumber(customerInfo.phone)
                };

                const orderResponse = await axios.post('/api/products/orders', orderDataWithUser);

                console.log('Order API Response:', orderResponse.data);

                if (orderResponse.data &&
                    (orderResponse.data.message === 'Order created' ||
                        orderResponse.data.message === 'Order created successfully' ||
                        orderResponse.data.success)) {

                    // Record coupon usage if applied
                    if (appliedCoupon) {
                        try {
                            await axios.post('/api/products/coupons/record-usage', {
                                userId: userId || null,
                                couponCode: appliedCoupon.code,
                                email: customerInfo.email,
                                phone: customerInfo.phone,
                            });
                        } catch (couponError) {
                            console.warn('Failed to record coupon usage:', couponError);
                        }
                    }

                    // Clear cart
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new Event('cartUpdated'));

                    // Show success message
                    showCustomToast(`Order ${orderData.orderId} placed successfully!`, 'success');

                    // Redirect to success page
                    setTimeout(() => {
                        if (paymentMethod === 'cod') {
                            router.push(`/checkout/order-success?orderId=${orderData.orderId}&payment=COD`);
                        } else if (paymentMethod === 'bkash') {
                            router.push(`/checkout/order-success?orderId=${orderData.orderId}&payment=bkash`);
                        }
                    }, 1500);

                } else {
                    throw new Error(orderResponse.data?.error || 'Order creation failed');
                }
            }
        } catch (err: any) {
            console.error('Order creation error:', err);

            let errorMessage = 'Payment processing failed';

            if (err.response) {
                errorMessage = err.response.data?.error ||
                    err.response.data?.message ||
                    `Server error: ${err.response.status}`;
                console.error('Server error details:', err.response.data);
            } else if (err.request) {
                errorMessage = 'No response from server. Please check your internet connection.';
            } else {
                errorMessage = err.message || 'Unknown error occurred';
            }

            setError(errorMessage);
            showCustomToast(errorMessage, 'error');
            setLoading(false);
        }
    };


    const isSubmitDisabled = (): boolean => {
        if (loading || validatingCart || cart.length === 0 || !acceptedTerms || !isFormValid) {
            return true;
        }

        if (customerInfo.country === 'Bangladesh') {
            if (!customerInfo.phone || customerInfo.phone.length !== 11 || !/^01[3-9]/.test(customerInfo.phone)) {
                return true;
            }
        }

        if (paymentMethod === 'bkash' && (!bkashNumber || !transactionId)) {
            return true;
        }

        return false;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto font-sans">

                {/* Empty Cart Message */}
                {cart.length === 0 && (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m5.5-5.5h.01M9 19h6m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Items in Cart</h2>
                            <p className="text-gray-600 mb-8">
                                Your cart is empty. Please add some products to proceed with checkout.
                            </p>
                            <button
                                onClick={() => router.push('/products')}
                                className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-gray-950 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                            >
                                Return To Shop
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {cart.length > 0 && (
                    <>
                        {/* Header */}
                        <div className="text-center mb-8 py-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-3 shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                                Secure Checkout
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center py-2 sm:py-3 px-2">
                                <p className="text-gray-600 text-sm sm:text-base mb-0 text-center sm:text-left">
                                    Complete your order with
                                </p>

                                <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-auto">
                                    <h4 className="text-gray-800 text-sm sm:text-base flex items-center justify-center gap-1">
                                        <span className="bg-gradient-to-r from-gray-600/20 to-transparent px-2 sm:px-3 rounded-md">SOOQRA</span>
                                        <span className="bg-gradient-to-r from-gray-600/20 to-transparent text-gray-800 px-2 sm:px-3 py-1 rounded-sm transform -rotate-2">
                                            One
                                        </span>
                                    </h4>
                                </div>
                            </div>

                            <div className="w-16 h-0.5 bg-gray-300 rounded-full mx-auto overflow-hidden">
                                <div className="w-3/4 h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-6 text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Billing Details */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Details</h2>
                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={customerInfo.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={customerInfo.email}
                                            onChange={handleInputChange}
                                            onBlur={() => setEmailTouched(true)}
                                            className={`w-full bg-white border rounded-lg p-3 focus:outline-none focus:ring-2 transition ${validationErrors.email && emailTouched
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-gray-800 focus:border-transparent'
                                                }`}
                                            required
                                            placeholder="example@gmail.com"
                                        />
                                        {validationErrors.email && emailTouched && (
                                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                {validationErrors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 text-sm bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                                                +88
                                            </span>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={customerInfo.phone}
                                                onChange={handlePhoneChange}
                                                className="w-full bg-white border border-gray-300 rounded-r-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                                placeholder="01XXXXXXXXX"
                                                maxLength={11}
                                                required
                                            />
                                        </div>
                                        {customerInfo.phone && customerInfo.phone.length === 11 && /^01[3-9]/.test(customerInfo.phone) && (
                                            <p className="text-green-600 text-xs mt-1">
                                                +88{customerInfo.phone}
                                            </p>
                                        )}
                                        {validationErrors.phone && (
                                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                {validationErrors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                        <textarea
                                            name="address"
                                            value={customerInfo.address}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                            rows={2}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={customerInfo.city}
                                                onChange={handleInputChange}
                                                className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                                            <input
                                                type="text"
                                                name="postcode"
                                                value={customerInfo.postcode}
                                                onChange={handleInputChange}
                                                className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <select
                                            name="country"
                                            value={customerInfo.country}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                        >
                                            <option value="Bangladesh">Bangladesh</option>
                                        </select>
                                    </div>

                                    {(paymentMethod === 'cod' || paymentMethod === 'bkash') && customerInfo.country === 'Bangladesh' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                                                <select
                                                    name="district"
                                                    value={customerInfo.district}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select District</option>
                                                    {Object.keys(districtsThanas).map((d) => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {customerInfo.district && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thana *</label>
                                                    <select
                                                        name="thana"
                                                        value={customerInfo.thana}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                                                        required
                                                    >
                                                        <option value="">Select Thana</option>
                                                        {districtsThanas[customerInfo.district]?.map((t) => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={customerInfo.notes}
                                            onChange={handleInputChange}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                            rows={3}
                                            placeholder="Any special instructions, delivery preferences, or additional information..."
                                            maxLength={500}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">
                                                Add any special instructions for delivery, packaging, or other preferences.
                                            </p>
                                            <span className={`text-xs ${customerInfo.notes.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {customerInfo.notes.length}/500
                                            </span>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Order Summary */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Order</h2>

                                    {validatingCart && (
                                        <div className="text-center py-4">
                                            <div className="inline-flex items-center text-gray-600">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Validating cart...
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div
                                                key={`${item._id}-${item.size || 'no-size'}`}
                                                className="flex items-start gap-4 pb-4 border-b border-gray-200"
                                            >
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <Image
                                                        src={item.mainImage || '/placeholder.png'}
                                                        alt={item.title || 'Product'}
                                                        fill
                                                        className="object-cover rounded-lg"
                                                        sizes="64px"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-gray-800">{item.title || 'Unknown Product'}</h3>
                                                    <p className="text-gray-600 text-xs">
                                                        ৳{(getBDTPrice(item) || 0).toLocaleString()} × {item.quantity || 1}
                                                    </p>
                                                    {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                                                </div>
                                                <div className="text-sm font-medium text-gray-800">
                                                    ৳{((getBDTPrice(item) || 0) * (item.quantity || 1)).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Coupon Section */}
                                        <div className="pt-2">
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={toggleCoupon}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 flex-shrink-0"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                                    />
                                                </svg>
                                                <span className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                                    Have a Coupon?
                                                </span>
                                            </div>

                                            <div
                                                className={`coupon-box overflow-hidden transition-all duration-300 ease-in-out ${isCouponOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'
                                                    }`}
                                            >
                                                {/* Mobile Layout */}
                                                <div className="sm:hidden space-y-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value)}
                                                            placeholder="Enter coupon code"
                                                            className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                                                        />
                                                        <button
                                                            onClick={toggleCoupon}
                                                            className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center justify-center"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={handleCouponApply}
                                                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm transition-colors"
                                                    >
                                                        Apply Coupon
                                                    </button>
                                                </div>

                                                {/* Desktop Layout */}
                                                <div className="hidden sm:flex items-center gap-2 relative">
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        placeholder="Enter coupon code"
                                                        className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                                                    />
                                                    <button
                                                        onClick={handleCouponApply}
                                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm whitespace-nowrap transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                    <button
                                                        onClick={toggleCoupon}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4 text-gray-500 hover:text-gray-800"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Messages */}
                                                <div className="mt-2">
                                                    {couponError && (
                                                        <p className="text-red-600 text-xs text-center sm:text-left break-words">{couponError}</p>
                                                    )}
                                                    {discount > 0 && (
                                                        <p className="text-green-600 text-xs text-center sm:text-left break-words">
                                                            Coupon applied! ৳{discount.toLocaleString()} discount
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-medium text-gray-800">৳{(subtotal || 0).toLocaleString()}</span>
                                            </div>

                                            {customerInfo.country === 'Bangladesh' && (paymentMethod === 'cod' || paymentMethod === 'bkash' || paymentMethod === 'pay_first') && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Shipping</span>
                                                    <span className="font-medium text-gray-800">
                                                        ৳{(Number.isFinite(shippingCharge) ? shippingCharge : 0).toLocaleString()}
                                                        {/*  Debug info যোগ করো */}
                                                        <span className="text-xs text-gray-400 ml-2">
                                                            ({customerInfo.district ?
                                                                (customerInfo.district.toLowerCase().includes('dhaka') ? 'Dhaka' : 'Other Districts')
                                                                : 'Not selected'})
                                                        </span>
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Discount</span>
                                                <span className="font-medium text-green-600">-৳{(discount || 0).toLocaleString()}</span>
                                            </div>

                                            <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                                                <span className="text-gray-800">Total</span>
                                                <span className="text-gray-900">৳{(Number.isFinite(payableAmount) ? payableAmount : 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment System */}
                                <CheckoutPayment
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    customerInfo={customerInfo}
                                    loading={loading || validatingCart}
                                    bkashNumber={bkashNumber}
                                    setBkashNumber={setBkashNumber}
                                    transactionId={transactionId}
                                    setTransactionId={setTransactionId}
                                    acceptedTerms={acceptedTerms}
                                    setAcceptedTerms={setAcceptedTerms}
                                    payableAmount={payableAmount}
                                    subtotal={subtotal}
                                    discount={discount}
                                    shippingCharge={shippingCharge}
                                />

                                {/* Place Order Button */}
                                <button
                                    type="submit"
                                    onClick={handleCheckout}
                                    disabled={isSubmitDisabled()}
                                    className={`w-full py-3.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium ${isSubmitDisabled() ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loading || validatingCart ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Place Order - ৳${(Number.isFinite(payableAmount) ? payableAmount : 0).toLocaleString()}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style jsx global>{`
        .custom-toast-checkout {
          position: fixed;
          top: 24px;
          right: 24px;
          background: white;
          color: #1f2937;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #374151;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1001;
          max-width: 320px;
        }

        .custom-toast-checkout.show {
          opacity: 1;
          transform: translateY(0);
        }

        .custom-toast-success {
          border-left-color: #10b981;
        }

        .custom-toast-error {
          border-left-color: #ef4444;
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toast-icon {
          width: 20px;
          height: 20px;
          color: #374151;
          flex-shrink: 0;
        }

        .custom-toast-success .toast-icon {
          color: #10b981;
        }

        .custom-toast-error .toast-icon {
          color: #ef4444;
        }

        .toast-message {
          flex: 1;
          font-size: 14px;
          line-height: 1.4;
          color: #374151;
        }

        .toast-close {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .toast-close:hover {
          color: #374151;
          background: rgba(0, 0, 0, 0.05);
        }

        .coupon-box {
          transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }

        .coupon-box.max-h-0 {
          max-height: 0;
          opacity: 0;
        }

        .coupon-box.max-h-40 {
          max-height: 10rem;
        }

        .coupon-box input {
          padding-right: 2.5rem;
        }

        .coupon-box button:hover {
          transform: scale(1.05);
        }
      `}</style>
        </div>
    );
}