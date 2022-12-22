export const getCookie = (name: String) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const last_entry = parts.pop();
    if (last_entry) return last_entry.split(";").shift();
  }
};
