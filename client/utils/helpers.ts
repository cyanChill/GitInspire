import { format, isBefore, sub } from "date-fns";

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

export const dateIgnoreTimeZone = (date: Date) => {
  const temp_date = new Date(date);
  const userTimezoneOffset = temp_date.getTimezoneOffset() * 60000;
  return new Date(
    date.getTime() + userTimezoneOffset * Math.sign(userTimezoneOffset)
  );
};

export const cleanDate = (date: Date) => {
  return format(dateIgnoreTimeZone(date), "MM/dd/yyyy kk:mm:ss");
};

export const cleanDate2 = (date: Date) => {
  return format(dateIgnoreTimeZone(date), "MMMM dd, yyyy kk:mm:ss");
};

export const isXDaysOld = (date: Date, days: number) => {
  return isBefore(new Date(date), sub(new Date(), { days: days }));
};

export const shrinkNum = (num: number) => {
  return Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(num);
};

export const replaceURLParam = (
  routePath: string,
  paramName: string,
  paramValue: string
) => {
  let href = new URL("https://google.com" + routePath);
  href.searchParams.set(paramName, paramValue);
  return href.toString().split("google.com")[1];
};
