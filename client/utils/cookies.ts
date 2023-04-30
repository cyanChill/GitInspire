export const getCookie = (name: String) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const last_entry = parts.pop();
    if (last_entry) return last_entry.split(";").shift();
  }
};

type FetchOptType = {
  headers?: { [x: string]: string };
  [x: string]: any;
};

export const authFetch = (resource: string, options: FetchOptType = {}) => {
  const { headers, ...rest } = options;
  return fetch(resource, {
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": getCookie("csrf_access_token") || "",
    },
    ...rest,
  });
};
