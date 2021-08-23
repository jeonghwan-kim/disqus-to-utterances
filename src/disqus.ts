import path from "path";
import fs from "fs";
import util from "util";
import { parseStringPromise } from "xml2js";

export interface Disqus {
  thread: Thread[];
  post: Post[];
}

/**
 * Blog Post
 */
export interface Thread {
  $: {
    "dsq:id": string;
  };
  id: [string];
  link: [string];
  title: [string];
  createdAt: [string];
  author: Author[];
  isClosed: ["false" | "true"];
  isDeleted: ["false" | "true"];
}

export interface Author {
  name: [string];
  isAnonymous: ["false" | "true"];
  username: [string];
}

/**
 * Comment
 */
export interface Post {
  message: [string];
  createdAt: [string];
  isDeleted: ["false" | "true"];
  isSpam: ["false" | "true"];
  author: Author[];
  thread: {
    $: {
      "dsq:id": string;
    };
  }[];
}

export const loadDisqusXml = async (filepath: string) => {
  const fileName = path.resolve(filepath);
  return util.promisify(fs.readFile)(fileName, "utf-8");
};

export const xmlToJson = async (xml: string): Promise<Disqus> => {
  const { disqus }: { disqus: Disqus } = await parseStringPromise(xml);
  return disqus;
};

export const activeThread = (thread: Thread): boolean =>
  thread.isDeleted[0] === "false" && thread.isClosed[0] === "false";
