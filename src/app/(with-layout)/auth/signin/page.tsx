import SignIn from '@/src/components/Auth/SignIn/SignIn';
import { Suspense } from 'react';


export const metadata = {
    title: 'Sign In | SOOQRA ONE',
    description: 'Sign in to your account',
};

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">

            </div>
        }>
            <SignIn />
        </Suspense>
    );
}