/*
  This provides a way to help with Search Engine Optimizations (SEO) by
  letting the user to set the page title, description, page name, etc.
*/

import Head from "next/head";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

interface SEOProps {
  title?: string;
  description?: string;
  pageName?: string;
  canocical?: string;
  ogType?: string;
}

export default function SEO({
  title = "GitInspire",
  description = "A platform to discover and bring life back to abandoned repositories and more.",
  pageName,
  canocical = DOMAIN,
  ogType = "website",
}: SEOProps) {
  return (
    <Head>
      <title>{!pageName ? title : `${pageName} | ${title}`}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={canocical ?? DOMAIN} />
      {/* Make pages & media findable in search engines */}
      <meta name="robots" content="index,follow" />

      {/* Social media meta tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={pageName} />
      <meta property="og:url" content={canocical ?? DOMAIN} />

      {/* Twitter meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}
