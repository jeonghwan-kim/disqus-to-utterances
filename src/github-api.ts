import axios from "axios";
import { Comment, Issue } from "./github";
import { dateFormat, urlToPathname } from "./helpers";

const owner = "jeonghwan-kim";
const repo = "jeonghwan-kim.github.com";

const headers = {
  Accept: "application/vnd.github.v3+json",
  Authorization: "token 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",
};

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

export default class GithubApi {
  static async createIssue(
    title: string,
    body: string
  ): Promise<CreateIssueResponse> {
    const { data } = await axios.post<CreateIssueResponse>(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      { title, body, labels: ["Comment"] },
      { headers }
    );

    return data;
  }

  static async createComment(
    issueNumber: number,
    body: string
  ): Promise<CreateCommentResponse> {
    const { data } = await axios.post<CreateCommentResponse>(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      { body },
      { headers }
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

>_Disqus에서 작성한 댓글입니다. ${dateFormat(createdAt)} ${author.name}(${
  author.userName
})_
`;
