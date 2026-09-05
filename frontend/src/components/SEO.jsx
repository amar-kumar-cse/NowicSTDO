import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  canonicalUrl, 
  schema, 
  keywords,
  ogImage = "https://www.nowicstdio.tech/image.png",
  ogType = "website",
  noIndex = false
}) => {
  const siteName = "Nowic Studio";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const robotsContent = noIndex 
    ? "noindex, nofollow" 
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Keywords (still used by Bing, Yandex, and some AI crawlers) */}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Geographic Meta (Local SEO + GEO signals) */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="language" content="en" />
      {canonicalUrl && (
        <>
          <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
          <link rel="alternate" hrefLang="en" href={canonicalUrl} />
          <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        </>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@nowicstudio" />
      <meta name="twitter:site" content="@nowicstudio" />

      {/* Author/Publisher Meta */}
      <meta name="author" content="Nowic Studio" />
      <meta name="publisher" content="Nowic Studio" />

      {/* Structured Data (JSON-LD) — supports single object or array */}
      {schema && (
        Array.isArray(schema) 
          ? schema.map((s, i) => (
              <script key={i} type="application/ld+json">
                {JSON.stringify(s)}
              </script>
            ))
          : (
              <script type="application/ld+json">
                {JSON.stringify(schema)}
              </script>
            )
      )}
    </Helmet>
  );
};

export default SEO;
