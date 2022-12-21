import { useState, useEffect, CSSProperties } from "react";

const client_id = process.env.NEXT_PUBLIC_CLIENT_ID;
const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;

/*
  Rough idea of implementing OAuth
    - For functionality, the app would be wrapped with a "User" context
      and we'll redirect away from this page if we're deemed to be
      logged in.
*/
export default function Login() {
  const [data, setData] = useState({ errMsg: "", isLoading: false });

  useEffect(() => {
    const url = window.location.href;
    const hasCode = url.includes("?code");

    // If Github returns the code parameter
    if (hasCode) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, "", newUrl[0]);

      const requestData = { code: newUrl[1] };
      const proxy_url = "http://localhost:5000/api/auth/authenticate";
      setData({ ...data, isLoading: true });

      fetch(proxy_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })
        .then((res) => res.json())
        .then((data) => {
          // Logged in succesfully
          console.log(data);

          // Redirect to different page
        })
        .catch((err) => {
          // Failed to login
          console.log(err);
          setData({ isLoading: false, errMsg: "Login Failed!" });
        });
    }
  }, []);

  const linkStyles = data.isLoading ? { color: "red" } : {};

  return (
    <div>
      <p>{data.errMsg}</p>
      <a
        href={`https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`}
        style={linkStyles as CSSProperties}
      >
        Login with Github
      </a>
    </div>
  );
}
