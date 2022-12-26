export const normalizeStr = (str: string) => {
  return str.toLowerCase().trim().replaceAll(" ", "_");
};
