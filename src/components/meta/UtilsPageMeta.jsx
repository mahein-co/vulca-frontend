import React from 'react';
import { Helmet } from 'react-helmet';

export default function UtilsPageMeta({ title, description }) {
    return (
        <Helmet>
            <title>{title || 'REKAPY - Comptabilité'}</title>
            <meta name="description" content={description || 'Application de comptabilité'} />
        </Helmet>
    );
}
