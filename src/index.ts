import chalk from "chalk";
import { resolve } from "path";
import prompts from "prompts";
import { activeThread, loadDisqusXml, xmlToJson } from "./disqus";
import { Env } from "./env";
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
import { println } from "./helpers";

const createIssueAndComments = async (issue: Issue) => {
  println();
  println(">>> Creating a github issue ...");

  const { number, html_url } = await GithubApi.createIssue(
    issueTitle(issue),
    issueBody(issue)
  );

  println(html_url);
  println(`<<< Github issue created.`);

  println(`>>> Creating github issue comments ...`);

  for await (const comment of issue.comments) {
    const { html_url } = await GithubApi.createComment(
      number,
      commentBody(comment)
    );
    println(`${html_url}`);
  }

  println(`<<< Github issue comments created.`);
};

const usage = (): string => {
  return `Usage: npm start disqus-backup-file-path`;
};

export const run = async () => {
  Env.disqusBackupFilePath = process.argv[2];
  if (!Env.disqusBackupFilePath) {
    println(usage());
    process.exit(0);
  }

  await Env.prompt();

  try {
    println(`Loading disqus backup file(${Env.disqusBackupFilePath}) ...`);

    const xml = await loadDisqusXml(
      resolve(__dirname, "..", Env.disqusBackupFilePath)
    );
    const { thread, post } = await xmlToJson(xml);

    println(
      `Disqus backup file(${
        Env.disqusBackupFilePath
      }) loaded: ${chalk.cyan.bold(thread.length)} posts and  ${chalk.cyan.bold(
        post.length
      )} comments found.`
    );

    const issues: Issue[] = thread
      .filter(activeThread)
      .map(createIssue)
      .sort(sortByCreatedAtAsc)
      .map((issue) => attachCommentOnIssue(issue, post))
      .filter(hasComments)
      .reduce<Issue[]>(mergeDuplicate, []);

    for await (const issue of issues) {
      println(`\n${issueToString(issue)}`);
      println();

      const { yn } = await prompts({
        type: "text",
        name: "yn",
        message: "Create this post and comments on github?(y/N/q)",
        initial: "n",
      });

      if (!yn || yn.toLowerCase() === "q") {
        println("Quit the program.");
        process.exit(0);
      }

      if (yn.toLowerCase() === "y") {
        await createIssueAndComments(issue);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

run();
