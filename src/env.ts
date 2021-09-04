import chalk from "chalk";
import prompts from "prompts";
import { println } from "./helpers";

export class Env {
  static githubUser: string;
  static githubRepo: string;
  static githubAccessToken: string;
  static disqusBackupFilePath: string;

  static get satisfied(): boolean {
    return !!Env.githubUser && !!Env.githubRepo && !!Env.githubAccessToken;
  }

  static async prompt() {
    await Env.promptGithuUser();
    await Env.promptGithuRepo();
    await Env.promptGithuApiToken();

    const { value } = await prompts({
      type: "confirm",
      name: "value",
      message: [
        `Is the information you entered corrent?`,
        `  githubUser: ${chalk.bold.cyan(Env.githubUser)}`,
        `  githubRepo: ${chalk.bold.cyan(Env.githubRepo)}`,
        `  githubAccessToken: ${chalk.bold.cyan(Env.githubAccessToken)}`,
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
      message: "Enter your Giuthub username.",
    });

    Env.githubUser = value;
  }

  static async promptGithuRepo() {
    println(`githubUser: ${chalk.cyan(Env.githubUser)}`);

    const { value } = await prompts({
      type: "text",
      name: "value",
      message: "Enter the github repository name.",
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
        "Enter your Github personal sccess token. Used to create issues and comments",
    });

    Env.githubAccessToken = value;
  }
}
