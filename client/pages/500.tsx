import PageRedirectForm from "~components/page_forms/PageRedirectForm";
import SEO from "~components/layout/SEO";

export default function Custom500Page() {
  return (
    <>
      <SEO pageName="500 Error" />
      <div className="flex h-full animate-load-in flex-col items-center justify-center">
        <span className="my-3 text-center font-bold text-red-400">500</span>
        <h1 className="text-center text-4xl font-bold">
          Server-side error occurred
        </h1>
        <p className="my-6 text-center">
          Sorry, something went wrong on the server.
        </p>

        <PageRedirectForm />
      </div>
    </>
  );
}
