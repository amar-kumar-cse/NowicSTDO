import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.nowicstdio.tech/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": `https://www.nowicstdio.tech${item.path}`
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" className="mb-8 overflow-x-auto whitespace-nowrap">
        <ol className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-muted">
          <li>
            <Link to="/" className="flex items-center transition-colors hover:text-text">
              <Home size={14} className="mr-1" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.path} className="flex items-center">
                <ChevronRight size={14} className="mx-1 opacity-50" />
                {isLast ? (
                  <span className="text-mint" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.path} className="transition-colors hover:text-text">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
