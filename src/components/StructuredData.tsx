import { Helmet } from "react-helmet-async";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

export const OrganizationSchema = ({
  name = "Cyber Ninja",
  url = "https://stealth-byte-station.lovable.app",
  logo = "https://stealth-byte-station.lovable.app/favicon.png",
  description = "Professional cybersecurity training platform offering courses, tools, and resources for ethical hacking and penetration testing.",
}: OrganizationSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: [
      "https://twitter.com/CyberNinja255",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Swahili"],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface WebsiteSchemaProps {
  name?: string;
  url?: string;
}

export const WebsiteSchema = ({
  name = "Cyber Ninja",
  url = "https://stealth-byte-station.lovable.app",
}: WebsiteSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/tools?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface CourseSchemaProps {
  name: string;
  description: string;
  provider?: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
}

export const CourseSchema = ({
  name,
  description,
  provider = "Cyber Ninja",
  url,
  image,
  price,
  currency = "USD",
}: CourseSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
      sameAs: "https://stealth-byte-station.lovable.app",
    },
    url,
    ...(image && { image }),
    ...(price !== undefined && {
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: currency,
        availability: "https://schema.org/InStock",
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}

export const ArticleSchema = ({
  headline,
  description,
  image,
  author = "Cyber Ninja",
  datePublished,
  dateModified,
  url,
}: ArticleSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image || "https://stealth-byte-station.lovable.app/favicon.png",
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Cyber Ninja",
      logo: {
        "@type": "ImageObject",
        url: "https://stealth-byte-station.lovable.app/favicon.png",
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface FAQSchemaProps {
  questions: Array<{ question: string; answer: string }>;
}

export const FAQSchema = ({ questions }: FAQSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
