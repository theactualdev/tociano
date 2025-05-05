import React from 'react';

const TermsOfService: React.FC = () => {
    return (
        <div className='flex flex-col gap-10 mt-10' style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>Terms of Service</h1>
            <p>Last updated: [Insert Date]</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>

            <h2>2. Changes to Terms</h2>
            <p>
                We reserve the right to update these terms at any time. Changes will be effective immediately upon posting. Please review these terms periodically.
            </p>

            <h2>3. Use of Services</h2>
            <p>
                You agree to use our services only for lawful purposes and in compliance with all applicable laws and regulations.
            </p>

            <h2>4. Intellectual Property</h2>
            <p>
                All content, trademarks, and intellectual property on this site are owned by us or our licensors. You may not use them without prior written consent.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
                We are not liable for any damages arising from your use of our services. Use them at your own risk.
            </p>

            <h2>6. Governing Law</h2>
            <p>
                These terms are governed by the laws of [Insert Jurisdiction]. Any disputes will be resolved in the courts of [Insert Jurisdiction].
            </p>

            <h2>7. Contact Us</h2>
            <p>
                If you have any questions about these Terms of Service, please contact us at [Insert Contact Information].
            </p>
        </div>
    );
};

export default TermsOfService;