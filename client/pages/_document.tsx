import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="text-slate-900 dark:text-white bg-zinc-100 dark:bg-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
