import axios from "axios";
import { Env } from "./env";
import { Comment, Issue } from "./github";
import { dateFormat, urlToPathname } from "./helpers";

interface CreateIssueResponse {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string;
}

interface CreateCommentResponse {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
}

function headers() {
  return {
    Accept: "application/vnd.github.v3+json",
    Authorization: `token ${Env.githubAccessToken}`,
  };
}

export default class GithubApi {
  static async createIssue(
    title: string,
    body: string
  ): Promise<CreateIssueResponse> {
    const { data } = await axios.post<CreateIssueResponse>(
      `https://api.github.com/repos/${Env.githubUser}/${Env.githubRepo}/issues`,
      { title, body, labels: ["Comment"] },
      { headers: headers() }
    );

    return data;
  }

  static async createComment(
    issueNumber: number,
    body: string
  ): Promise<CreateCommentResponse> {
    const { data } = await axios.post<CreateCommentResponse>(
      `https://api.github.com/repos/${Env.githubUser}/${Env.githubRepo}/issues/${issueNumber}/comments`,
      { body },
      { headers: headers() }
    );

    return data;
  }
}

export const issueTitle = ({ postUrl }: Issue): string =>
  urlToPathname(postUrl);

export const issueBody = ({ postTitle, postUrl }: Issue): string => `
# ${postTitle}

${postUrl}
`;

export const commentBody = ({
  message,
  createdAt,
  author,
}: Comment): string => `
${message}

>_This comment was made by Disqus. ${dateFormat(createdAt)} ${author.name}(${
  author.userName
})_
`;
