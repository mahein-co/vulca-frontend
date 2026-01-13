import React from 'react';
import AuthIndexLogin from './views/auth/pages/AuthIndexLogin';
import AuthLayout from './views/auth/layout/AuthLayout';

export default function LoginPage() {
    return (
        <AuthLayout>
            <AuthIndexLogin />
        </AuthLayout>
    );
}
