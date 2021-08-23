import { xmlToJson, activeThread } from "./disqus";
import {
  attachCommentOnIssue,
  createIssue,
  hasComments,
  Issue,
  mergeDuplicate,
  sortByCreatedAtAsc,
} from "./github";

export const convert = async (xml: string): Promise<Issue[]> => {
  const { thread, post } = await xmlToJson(xml);

  return thread
    .filter(activeThread)
    .map(createIssue)
    .sort(sortByCreatedAtAsc)
    .map((issue) => attachCommentOnIssue(issue, post))
    .filter(hasComments)
    .reduce<Issue[]>(mergeDuplicate, []);
};
