import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-zinc-100 dark:bg-slate-900 text-slate-900 dark:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
