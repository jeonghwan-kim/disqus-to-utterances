import chalk from "chalk";
import { Post, Thread } from "./disqus";
import { dateFormat, idFormat, urlToPathname } from "./helpers";

export interface Issue {
  postId: string;
  postUrl: string;
  postTitle: string;
  postAuthor: Writer;
  createdAt: string;
  comments: Comment[];
}

export interface Writer {
  name: string;
  userName: string;
  isAnonymous: boolean;
}

export interface Comment {
  message: string;
  createdAt: string;
  author: Writer;
}

export const createIssue = (thread: Thread): Issue => ({
  postId: thread.$["dsq:id"],
  postUrl: thread.link[0],
  postTitle: thread.title[0],
  createdAt: thread.createdAt[0],
  postAuthor: {
    isAnonymous: JSON.parse(thread.author[0].isAnonymous[0]),
    name: thread.author[0].name[0],
    userName: thread.author[0].username[0],
  },
  comments: [],
});

export const sortByCreatedAtAsc = (
  prev: Issue | Comment,
  next: Issue | Comment
) => new Date(prev.createdAt).getTime() - new Date(next.createdAt).getTime();

export const attachCommentOnIssue = (issue: Issue, posts: Post[]): Issue => {
  const foundPosts = posts.filter(
    (post) => post.thread[0].$["dsq:id"] === issue.postId
  );

  const comments = foundPosts.map(createComment);

  return {
    ...issue,
    postAuthor: {
      ...issue.postAuthor,
    },
    comments: comments.sort(sortByCreatedAtAsc),
  };
};

export const createComment = (post: Post): Comment => ({
  createdAt: post.createdAt[0],
  message: post.message[0],
  author: {
    isAnonymous: JSON.parse(post.author[0].isAnonymous[0]),
    name: post.author[0].name[0],
    userName: post.author[0].username[0],
  },
});

export const hasComments = (issue: Issue): boolean => issue.comments.length > 0;

export const mergeDuplicate = (issues: Issue[], issue: Issue) => {
  const issueHasDuplicated = issues.find(
    (i) => i.postTitle === issue.postTitle
  );

  if (issueHasDuplicated) {
    issueHasDuplicated.comments.push(...issue.comments);
    return issues;
  }

  return [...issues, issue];
};

export const issueToString = ({ postTitle, createdAt, comments }: Issue) =>
  [
    chalk.cyan.bold(`${dateFormat(createdAt)} ${postTitle}`),
    comments
      .map((comment, index) => commentToString(comment, index, "  "))
      .join("\n"),
  ].join("\n");

const commentToString = (
  { message, createdAt, author }: Comment,
  index: number,
  prefix = ""
): string =>
  [
    `${prefix}${idFormat(index + 1)} ${dateFormat(createdAt)} ${author.name}(${
      author.userName
    })`,
    `${prefix}    ${message.slice(0, 100)}`,
  ].join("\n");
