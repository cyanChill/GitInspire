import PageRedirectForm from "~components/page_forms/PageRedirectForm";

export default function Custom404Page() {
  return (
    <div className="flex h-full animate-load-in flex-col items-center justify-center">
      <span className="my-3 text-center font-bold text-red-400">404</span>
      <h1 className="text-center text-4xl font-bold">
        This page does not exist
      </h1>
      <p className="my-6 text-center">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>

      <PageRedirectForm />
    </div>
  );
}
