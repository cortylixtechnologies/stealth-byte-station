import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

const SEO = ({
  title = "Cyber Ninja - Cybersecurity Training & Tools",
  description = "Master cybersecurity with Cyber Ninja. Access professional hacking tools, courses, tutorials, and resources. Learn ethical hacking, penetration testing, and network security.",
  keywords = "cybersecurity, ethical hacking, penetration testing, hacking tools, security courses, network security, cyber ninja, infosec training, security tutorials",
  image = "https://stealth-byte-station.lovable.app/favicon.png",
  url = "https://stealth-byte-station.lovable.app",
  type = "website",
  author = "Cyber Ninja",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: SEOProps) => {
  const siteName = "Cyber Ninja";
  const fullTitle = title.includes("Cyber Ninja") ? title : `${title} | Cyber Ninja`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@CyberNinja255" />
      <meta name="twitter:creator" content="@CyberNinja255" />

      {/* Article specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && (
        <meta property="article:author" content={author} />
      )}

      {/* Additional SEO */}
      <meta name="theme-color" content="#00ff41" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
    </Helmet>
  );
};

export default SEO;
