import { URLQueryValType } from "./types";

export const normalizeStr = (str: string) => {
  return str.toLowerCase().trim().replaceAll(" ", "_");
};

/*
  Object containing functions that should be used on the value of a URL
  query parameter obtainable from "router.query" with "next/router"
    - Functions will return "undefined" if requirements aren't met
*/
export const fromURLQueryVal = {
  // Returns an array if input is an array or from splitting a string with
  // a separater
  toArr: (queryVal: URLQueryValType, separator: string) => {
    if (!queryVal) return undefined;
    return Array.isArray(queryVal) ? queryVal : queryVal.split(separator);
  },
  // Returns a positive integer from a string
  toPosInt: (queryVal: URLQueryValType) => {
    if (!queryVal || Array.isArray(queryVal)) return undefined;
    if (Number.isInteger(+queryVal) && +queryVal > 0) return +queryVal;
  },
  // Returns only if input is a string
  onlyStr: (queryVal: URLQueryValType) => {
    if (!queryVal || Array.isArray(queryVal)) return undefined;
    return queryVal;
  },
};
