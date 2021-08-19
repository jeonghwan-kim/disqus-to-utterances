import { resolve } from "path";
import { activeThread, loadDisqusXml, xmlToJson } from "./disqus";
import {
  attachCommentOnIssue,
  createIssue,
  hasComments,
  Issue,
  issueToString,
  mergeDuplicate,
  sortByCreatedAtAsc,
} from "./github";

(async () => {
  try {
    const xml = await loadDisqusXml(resolve(__dirname, "../disqus.xml"));
    const { thread, post } = await xmlToJson(xml);

    console.log("thread: ", thread.length, "post: ", post.length);

    const issues: Issue[] = thread
      .filter(activeThread)
      .map(createIssue)
      .sort(sortByCreatedAtAsc)
      .map((issue) => attachCommentOnIssue(issue, post))
      .filter(hasComments)
      .reduce<Issue[]>(mergeDuplicate, []);

    process.stdout.write(issues.map(issueToString).join("\n"));
  } catch (e) {
    console.error(e);
  }
})();
