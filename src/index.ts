import { resolve } from "path";
import prompts from "prompts";
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
import GithubApi, { commentBody, issueBody, issueTitle } from "./github-api";

const createIssueAndComments = async (issue: Issue) => {
  process.stdout.write(">>> 이슈 생성 중 ...\n");
  const { number, html_url } = await GithubApi.createIssue(
    issueTitle(issue),
    issueBody(issue)
  );
  process.stdout.write(`<<< 이슈 생성 완료(${number}): ${html_url}\n`);

  process.stdout.write(`>>> 댓글 생성 중 ...\n`);
  // issue.comments.forEach(async (comment, index) => {
  //   const { html_url } = await GithubApi.createComment(
  //     number,
  //     commentBody(comment)
  //   );
  //   process.stdout.write(`[${index + 1}] ${html_url}\n`);
  // });

  for await (const comment of issue.comments) {
    const { html_url } = await GithubApi.createComment(
      number,
      commentBody(comment)
    );
    process.stdout.write(`${html_url}\n`);
  }

  process.stdout.write(`<<< 댓글 생성 완료\n`);
};

(async () => {
  try {
    const xml = await loadDisqusXml(resolve(__dirname, "../disqus.xml"));
    const { thread, post } = await xmlToJson(xml);

    process.stdout.write(`thread: ${thread.length}, post: ${post.length}\n`);

    const issues: Issue[] = thread
      .filter(activeThread)
      .map(createIssue)
      .sort(sortByCreatedAtAsc)
      .map((issue) => attachCommentOnIssue(issue, post))
      .filter(hasComments)
      .reduce<Issue[]>(mergeDuplicate, []);

    // issues.forEach(async (issue) => {
    //   process.stdout.write(issueToString(issue));

    //   const { yn } = await prompts({
    //     type: "text",
    //     name: "yn",
    //     message: "\n이 포스트와 댓글을 깃헙에 생성할까요?(y/N/q)",
    //   });
    //   if (yn.toLowerCase() === "q") {
    //     process.exit(0);
    //   }
    //   if (yn.toLowerCase() === "y") {
    //     // await createIssueAndComments(issue);
    //     console.log("ik");
    //   }
    // });

    for await (const issue of issues) {
      process.stdout.write(`\n${issueToString(issue)}\n`);

      const { yn } = await prompts({
        type: "text",
        name: "yn",
        message: "\n이 포스트와 댓글을 깃헙에 생성할까요?(y/N/q)",
      });
      if (yn.toLowerCase() === "q") {
        process.exit(0);
      }
      if (yn.toLowerCase() === "y") {
        await createIssueAndComments(issue);
      }
    }
  } catch (e) {
    console.error(e);
  }

  try {
  } catch (e) {
    console.error(e);
  }
})();
