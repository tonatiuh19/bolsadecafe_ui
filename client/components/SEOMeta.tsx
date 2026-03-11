import { Helmet } from "react-helmet-async";

const SITE_NAME = "Bolsadecafé";
const SITE_URL = "https://bolsadecafe.com";
const FAVICON_URL =
  "https://disruptinglabs.com/data/bolsadecafe/assets/images/favicon.ico";
const LOGO_URL =
  "https://disruptinglabs.com/data/bolsadecafe/assets/images/logo_dark.png";
const DEFAULT_IMAGE =
  "https://disruptinglabs.com/data/bolsadecafe/assets/images/hero-image.jpg";
const BRAND_COLOR = "#1a3578";

interface SEOMetaProps {
  title?: string;
  description?: string;
  /** Absolute URL of the page's OG image. Falls back to hero image. */
  image?: string;
  /** Canonical path, e.g. "/" or "/subscription-wizard". */
  path?: string;
  /** "website" | "article" | "product" */
  type?: string;
  /** Set to true to block indexing (e.g. checkout pages). */
  noIndex?: boolean;
  /** Extra keywords to append to the base set. */
  keywords?: string[];
}

const BASE_KEYWORDS = [
  "café mexicano",
  "suscripción de café",
  "café de especialidad",
  "café artesanal",
  "Bolsadecafé",
  "entrega de café",
  "café premium México",
];

export default function SEOMeta({
  title,
  description = "Café mexicano premium, tostado artesanalmente y entregado en tu puerta cada mes. Descubre nuestros planes de suscripción.",
  image = DEFAULT_IMAGE,
  path = "/",
  type = "website",
  noIndex = false,
  keywords = [],
}: SEOMetaProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Café mexicano premium a tu puerta`;
  const canonicalUrl = `${SITE_URL}${path}`;
  const allKeywords = [...BASE_KEYWORDS, ...keywords].join(", ");

  return (
    <Helmet>
      {/* ── Primary ──────────────────────────────────── */}
      <html lang="es" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="theme-color" content={BRAND_COLOR} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Favicon ──────────────────────────────────── */}
      <link rel="icon" type="image/x-icon" href={FAVICON_URL} />
      <link rel="shortcut icon" href={FAVICON_URL} />

      {/* ── Robots ───────────────────────────────────── */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* ── Open Graph ───────────────────────────────── */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="es_MX" />

      {/* ── Twitter Card ─────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* ── Structured Data (JSON-LD) ─────────────────── */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: LOGO_URL,
          description,
          sameAs: [
            "https://www.instagram.com/bolsadecafe",
            "https://www.facebook.com/bolsadecafe",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            email: "hola@bolsadecafe.com",
            contactType: "customer service",
            areaServed: "MX",
            availableLanguage: "Spanish",
          },
        })}
      </script>
    </Helmet>
  );
}
