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
  println(">>> 이슈 생성 중 ...");

  const { number, html_url } = await GithubApi.createIssue(
    issueTitle(issue),
    issueBody(issue)
  );

  println(html_url);
  println(`<<< 이슈 생성 완료: `);

  println(`>>> 댓글 생성 중 ...`);

  for await (const comment of issue.comments) {
    const { html_url } = await GithubApi.createComment(
      number,
      commentBody(comment)
    );
    println(`${html_url}`);
  }

  println(`<<< 댓글 생성 완료`);
};

const usage = (): string => {
  return `usage npm start disqus-backup-file-path`;
};

export const run = async () => {
  Env.disqusBackupFilePath = process.argv[2];
  if (!Env.disqusBackupFilePath) {
    println(usage());
    process.exit(0);
  }

  await Env.prompt();

  try {
    println(`disqus.xml 파일 로딩 중...`);

    const xml = await loadDisqusXml(
      resolve(__dirname, "..", Env.disqusBackupFilePath)
    );
    const { thread, post } = await xmlToJson(xml);

    println(
      `disqus.xml 파일 로딩 완료: ${chalk.cyan.bold(
        thread.length
      )}개 포스트와  ${chalk.cyan.bold(post.length)}개 댓글을 찾았습니다.`
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
        message: "이 포스트와 댓글을 깃헙에 생성할까요?(y/N/q)",
        initial: "n",
      });

      if (!yn || yn.toLowerCase() === "q") {
        println("프로그램을 종료합니다.");
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
