'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time password validation
        if (name === 'password') {
            validatePasswordStrength(value);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validatePasswordStrength = (password: string) => {
        const errors = [];

        if (password.length < 8) {
            errors.push('• At least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('• One uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('• One lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('• One number');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('• One special character (@, #, $, etc.)');
        }

        setPasswordErrors(errors);
    };

    const checkPasswordStrength = (password: string): { isValid: boolean; message: string } => {
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!/[A-Z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one special character (@, #, $, etc.)' };
        }
        return { isValid: true, message: '' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Password match validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Final password strength validation
        const passwordValidation = checkPasswordStrength(formData.password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.message);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            router.push('/auth/signin?message=Registration successful! Please sign in.');
        } catch (error: any) {
            setError(error.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        const totalChecks = 5;
        const passedChecks = totalChecks - passwordErrors.length;

        if (passedChecks === 0) return 'bg-gray-200';
        if (passedChecks <= 2) return 'bg-red-500';
        if (passedChecks <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        const totalChecks = 5;
        const passedChecks = totalChecks - passwordErrors.length;

        if (passedChecks === 0) return 'Very Weak';
        if (passedChecks <= 2) return 'Weak';
        if (passedChecks <= 4) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link href="/auth/signin" className="font-medium text-gray-800 hover:text-gray-900">
                            sign in to existing account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                                placeholder="+880 1234 567890"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password Field with Eye Icon */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 pr-10"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Password Strength:</span>
                                        <span className={`text-xs font-medium ${getPasswordStrengthText() === 'Strong' ? 'text-green-600' :
                                            getPasswordStrengthText() === 'Medium' ? 'text-yellow-600' :
                                                getPasswordStrengthText() === 'Weak' ? 'text-red-600' :
                                                    'text-gray-600'
                                            }`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                                            style={{ width: `${((5 - passwordErrors.length) / 5) * 100}%` }}
                                        ></div>
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="mt-3 text-xs text-gray-600">
                                        <p className="font-medium mb-1">Password must contain:</p>
                                        <ul className="space-y-1">
                                            <li className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                                                ✓ At least 8 characters
                                            </li>
                                            <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                                                ✓ One uppercase letter (A-Z)
                                            </li>
                                            <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                                                ✓ One lowercase letter (a-z)
                                            </li>
                                            <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                                                ✓ One number (0-9)
                                            </li>
                                            <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                                                ✓ One special character (@, #, $, etc.)
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field with Eye Icon */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 pr-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? 'border-red-500 bg-red-50'
                                        : formData.confirmPassword && formData.password === formData.confirmPassword
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300'
                                        }`}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}