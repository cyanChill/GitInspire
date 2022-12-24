import { Toaster } from "react-hot-toast";

import "../styles/globals.css";
import type { AppProps } from "next/app";
import UserContextProvider from "~context/userContext";
import ThemeContextProvider from "~context/themeContext";
import Layout from "~components/Layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <ThemeContextProvider>
        <Toaster position="bottom-center" />

        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeContextProvider>
    </UserContextProvider>
  );
}
