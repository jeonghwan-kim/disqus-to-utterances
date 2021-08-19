import { Post, Thread } from "./disqus";
import { dateFormat, idFormat } from "./helpers";

export interface Issue {
  postId: string;
  postUrl: string;
  postTitle: string;
  postAuthor: {
    name: string;
    userName: string;
    isAnonymous: boolean;
  };
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  message: string;
  createdAt: string;
  author: {
    name: string;
    userName: string;
    isAnonymous: boolean;
  };
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

  if (!issueHasDuplicated) {
    return [...issues, issue];
  }

  const url = new URL(issueHasDuplicated.postUrl).pathname.replace(
    /^\/\//,
    "/"
  );
  issueHasDuplicated.postUrl = url.toString();
  issueHasDuplicated.comments.push(...issue.comments);
  return issues;
};

export const issueToString = (
  { postTitle, createdAt, comments }: Issue,
  index: number
) =>
  [
    `${idFormat(index + 1)} ${dateFormat(createdAt)} ${postTitle}`,
    comments
      .map((comment, index) => commentToString(comment, index, "    "))
      .join("\n"),
  ].join("\n");

const commentToString = (
  { message, createdAt, author }: Comment,
  index: number,
  prefix = ""
): string =>
  [
    `${prefix}${idFormat(index + 1)} ${message.slice(0, 40)}`,
    `작성일: ${dateFormat(createdAt)}`,
    `작성자: ${author.name}(${author.userName})`,
  ].join("\n");
