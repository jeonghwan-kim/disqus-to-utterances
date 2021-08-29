import chalk from "chalk";
import prompts from "prompts";
import { println } from "./helpers";

export class Env {
  static githubUser: string;
  static githubRepo: string;
  static githubApiToken: string;
  static disqusBackupFilePath: string;

  static get satisfied(): boolean {
    return !!Env.githubUser && !!Env.githubRepo && !!Env.githubApiToken;
  }

  static async prompt() {
    await Env.promptGithuUser();
    await Env.promptGithuRepo();
    await Env.promptGithuApiToken();

    const { value } = await prompts({
      type: "confirm",
      name: "value",
      message: [
        `입력한 정보가 맞습니까?`,
        `  githubUser: ${chalk.bold.cyan(Env.githubUser)}`,
        `  githubRepo: ${chalk.bold.cyan(Env.githubRepo)}`,
        `  githubApiToken: ${chalk.bold.cyan(Env.githubApiToken)}`,
      ].join("\n"),
    });

    if (!value) {
      await Env.prompt();
    }
  }

  static async promptGithuUser() {
    const { value } = await prompts({
      type: "text",
      name: "value",
      message: "깃헙 사용자 이름을 입력하세요.",
    });

    Env.githubUser = value;
  }

  static async promptGithuRepo() {
    println(`githubUser: ${chalk.cyan(Env.githubUser)}`);

    const { value } = await prompts({
      type: "text",
      name: "value",
      message: "깃헙 저장소 이름을 입력하세요.",
    });

    Env.githubRepo = value;
  }

  static async promptGithuApiToken() {
    println(`githubUser: ${chalk.cyan(Env.githubUser)}`);
    println(`githubRepo: ${chalk.cyan(Env.githubRepo)}`);

    const { value } = await prompts({
      type: "text",
      name: "value",
      message:
        "깃헙 API 토큰을 입력하세요. 이슈와 댓글을 생성하는데 사용합니다.",
    });

    Env.githubApiToken = value;
  }
}
