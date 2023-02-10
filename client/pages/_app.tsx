import { Toaster } from "react-hot-toast";

import "../styles/globals.css";
import type { AppProps } from "next/app";
import AppContextProvider from "~context/appContext";
import UserContextProvider from "~context/userContext";
import ThemeContextProvider from "~context/themeContext";
import Layout from "~components/layout/Layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <ThemeContextProvider>
        <AppContextProvider>
          <Toaster position="bottom-center" />

          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AppContextProvider>
      </ThemeContextProvider>
    </UserContextProvider>
  );
}
