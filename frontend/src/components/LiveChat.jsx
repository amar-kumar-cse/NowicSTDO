import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tawk.to Live Chat integration.
 * To enable, set VITE_TAWKTO_PROPERTY_ID and VITE_TAWKTO_WIDGET_ID in .env
 * Example:
 * VITE_TAWKTO_PROPERTY_ID="670b8c6a2480f5b4f58c7..."
 * VITE_TAWKTO_WIDGET_ID="1j2..."
 */
export default function LiveChat() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Don't load chat in admin dashboard
    if (isAdmin) return;

    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID;
    const widgetId = import.meta.env.VITE_TAWKTO_WIDGET_ID || 'default';

    if (!propertyId) return;

    // Standard Tawk.to installation script
    var Tawk_API = window.Tawk_API || {}, Tawk_LoadStart = new Date();
    
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts (optional, but good practice for SPAs)
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Remove Tawk.to DOM elements if they exist
      const tawkElements = document.querySelectorAll('iframe[title="chat widget"]');
      tawkElements.forEach(el => el.remove());
    };
  }, [isAdmin]);

  return null;
}
