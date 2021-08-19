import dayjs from "dayjs";

export const idFormat = (id: number): string => `[${id}]`;

export const dateFormat = (date: string): string =>
  dayjs(date).format("YYYY-MM-DD hh:mm:ss");
