import dayjs from "dayjs";

export const idFormat = (id: number): string => `[${id}]`;

export const dateFormat = (date: string): string =>
  dayjs(date).format("YYYY-MM-DD hh:mm:ss");

export const urlToPathname = (url: string): string =>
  new URL(url).pathname.replace(/^\//g, "");

export const println = (message: string = "") =>
  process.stdout.write(`${message}\n`);
