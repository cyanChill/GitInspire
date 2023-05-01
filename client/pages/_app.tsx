import type { AppProps } from "next/app";
import { Source_Code_Pro } from "@next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";

import "../styles/globals.css";
import AppContextProvider from "~context/appContext";
import UserContextProvider from "~context/userContext";
import ThemeContextProvider from "~context/themeContext";
import Layout from "~components/layout/Layout";

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-source-code-pro: ${sourceCodePro.style.fontFamily};
        }
      `}</style>

      <UserContextProvider>
        <ThemeContextProvider>
          <AppContextProvider>
            <Toaster position="bottom-center" />

            <Layout>
              <Component {...pageProps} />
              <Analytics />
            </Layout>
          </AppContextProvider>
        </ThemeContextProvider>
      </UserContextProvider>
    </>
  );
}
