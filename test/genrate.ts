import faker from "faker";
import { Author, Post, Thread } from "../src/disqus";

export const buildThreadXml = (option?: Partial<Thread>) => `
<thread dsq:id="${option?.$?.["dsq:id"] || faker.datatype.uuid()}">
  <link>${option?.link || faker.internet.url()}</link>
  <title>${option?.title || faker.name.title()}</title>
  <createdAt>${
    option?.createdAt || faker.date.recent().toISOString()
  }</createdAt>
  ${buildAuthorXml(option?.author?.[0])}
  <isClosed>${option?.isClosed || "false"}</isClosed>
  <isDeleted>${option?.isDeleted || "false"}</isDeleted>
</thread>
`;

export const buildPostXml = (option?: Partial<Post>) => `
<post dsq:id="5492538734">
  <message><![CDATA[${option?.message || faker.lorem.sentences()}]]></message>
  <createdAt>${
    option?.createdAt || faker.date.recent().toISOString()
  }</createdAt>
  <isDeleted>${option?.isDeleted || "false"}</isDeleted>
  <isSpam>${option?.isSpam || "false"}</isSpam>
  ${buildAuthorXml(option?.author?.[0])}
  <thread dsq:id="${
    option?.thread?.[0].$["dsq:id"] || faker.datatype.uuid()
  }" />
</post>
`;

export const buildAuthorXml = (option?: Partial<Author>) => `
<author>
  <name>${option?.name?.[0] || faker.name.firstName()}</name>
  <isAnonymous>false</isAnonymous>
  <username>${option?.username?.[0] || faker.internet.userName()}</username>
</author>
`;

export const buildDisqusXml = (options?: {
  threadXml?: string[];
  postXml?: string[];
}) => `
<?xml version="1.0" encoding="utf-8"?>
<disqus>
  ${(options?.threadXml || []).join("") || buildThreadXml()}
  ${(options?.postXml || []).join("") || buildPostXml()}
</disqus>
`;
