import { Toaster } from "react-hot-toast";

import "../styles/globals.css";
import type { AppProps } from "next/app";
import RepotContextProvider from "~context/repotContext";
import UserContextProvider from "~context/userContext";
import ThemeContextProvider from "~context/themeContext";
import Layout from "~components/layout/Layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <ThemeContextProvider>
        <RepotContextProvider>
          <Toaster position="bottom-center" />

          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RepotContextProvider>
      </ThemeContextProvider>
    </UserContextProvider>
  );
}
