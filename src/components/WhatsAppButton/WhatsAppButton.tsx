// src/components/WhatsAppButton/WhatsAppButton.tsx
'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const WhatsAppButton = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);

        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    const handleClick = () => {
        const phoneNumber = "8801571083401"; // Replace with your number
        const message = "Hi! I need help with Sooqra One products";
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Mobile: only icon (no text)
    if (isMobile) {
        return (
            <button
                onClick={handleClick}
                className="whatsapp-float-btn whatsapp-mobile"
                style={{
                    position: 'fixed',
                    right: '16px',
                    bottom: '16px',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '48px',
                    height: '48px',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#075E54';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D366';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                <FaWhatsapp size={24} />
            </button>
        );
    }

    // MD, LG, XL devices: Text on top of icon (NO BACKGROUND, separate elements)
    return (
        <div
            style={{
                position: 'fixed',
                right: '24px',
                bottom: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
            }}
            onClick={handleClick}
        >
            {/* Text above icon */}
            <div
                style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#075E54';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D366';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                Chat on WhatsApp
            </div>

            {/* Icon below text */}
            <div
                style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                    transition: 'all 0.3s ease',
                    animation: 'whatsappPulse 2s infinite',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#075E54';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D366';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 211, 102, 0.4)';
                }}
            >
                <FaWhatsapp size={22} />
            </div>

            <style>{`
        @keyframes whatsappPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }
      `}</style>
        </div>
    );
};

export default WhatsAppButton;




