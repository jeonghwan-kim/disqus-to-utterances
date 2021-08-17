import { readFile } from "fs";
import { resolve } from "path";
import { promisify } from "util";
import { parseStringPromise } from "xml2js";

/**
 * Blog Post
 */
interface Thread {
  $: {
    "dsq:id": string;
  };
  id: [string];
  link: [string];
  title: [string];
  createdAt: [string];
  author: {
    name: [string];
    isAnonymous: ["false" | "true"];
    username: [string];
  }[];
  isClosed: ["false" | "true"];
  isDeleted: ["false" | "true"];
}

/**
 * Comment
 */
interface Post {
  message: [string];
  createdAt: [string];
  isDeleted: ["false" | "true"];
  isSpam: ["false" | "true"];
  author: {
    name: [string];
    isAnonymous: ["false" | "true"];
    username: [string];
  }[];
  thread: {
    $: {
      "dsq:id": string;
    };
  }[];
}

interface Disqus {
  thread: Thread[];
  post: Post[];
}

interface GithubIssue {
  postId: string;
  postUrl: string;
  postTitle: string;
  postAuthor: {
    name: string;
    userName: string;
    isAnonymous: boolean;
  };
  createdAt: string;
  comments: GithubIssueComment[];
}

interface GithubIssueComment {
  message: string;
  createdAt: string;
  author: {
    name: string;
    userName: string;
    isAnonymous: boolean;
  };
}

(async () => {
  try {
    const fileName = resolve(__dirname, "../disqus.xml");
    const disqusXml = await promisify(readFile)(fileName, "utf-8");
    const { disqus }: { disqus: Disqus } = await parseStringPromise(disqusXml);
    const { thread, post } = disqus;

    console.log("thread: ", thread.length, "post: ", post.length);

    const githubIssueList: GithubIssue[] = thread
      .filter((t) => {
        return t.isDeleted[0] === "false" && t.isClosed[0] === "false";
      })
      .map((t) => {
        const githubIssue: GithubIssue = {
          postId: t.$["dsq:id"],
          postUrl: t.link[0],
          postTitle: t.title[0],
          createdAt: t.createdAt[0],
          postAuthor: {
            isAnonymous: JSON.parse(t.author[0].isAnonymous[0]),
            name: t.author[0].name[0],
            userName: t.author[0].username[0],
          },
          comments: [],
        };

        return githubIssue;
      })
      .sort((prev, next) => {
        return (
          new Date(prev.createdAt).getTime() -
          new Date(next.createdAt).getTime()
        );
      });

    post
      .sort((a, b) => {
        return (
          new Date(a.createdAt[0]).getTime() -
          new Date(b.createdAt[0]).getTime()
        );
      })
      .forEach((p) => {
        const githubIssue = githubIssueList.find((githubIssue) => {
          return (
            !!githubIssue.postId &&
            githubIssue.postId === p.thread[0].$["dsq:id"]
          );
        });
        if (!githubIssue) {
          return;
        }

        const comment: GithubIssueComment = {
          createdAt: p.createdAt[0],
          message: p.message[0],
          author: {
            isAnonymous: JSON.parse(p.author[0].isAnonymous[0]),
            name: p.author[0].name[0],
            userName: p.author[0].username[0],
          },
        };
        githubIssue.comments.push(comment);
      });

    console.log("githubIssueList", githubIssueList.length);
    console.log(githubIssueList[0].comments.length);
    console.log(githubIssueList[githubIssueList.length - 1].comments.length);

    const githubIssueListHasComments: GithubIssue[] = githubIssueList.filter(
      (githubIssue) => {
        return githubIssue.comments.length > 0;
      }
    );

    const githubIssueListNoDuplicated: GithubIssue[] =
      githubIssueListHasComments.reduce<GithubIssue[]>((acc, item) => {
        const itemHasDuplicatedTitle = acc.find(
          (a) => a.postTitle === item.postTitle
        );
        if (itemHasDuplicatedTitle) {
          const url = new URL(itemHasDuplicatedTitle.postUrl).pathname.replace(
            /^\/\//,
            "/"
          );
          itemHasDuplicatedTitle.postUrl = url.toString();
          itemHasDuplicatedTitle.comments.push(...item.comments);
        } else {
          acc.push(item);
        }

        return acc;
      }, []);

    process.stdout.write(
      githubIssueListNoDuplicated
        .map((g, idx) => {
          return `${idx + 1} ${g.postTitle}\n${g.comments
            .map(
              (c, index) =>
                `    ${index + 1} ${c.message.slice(0, 40)} - ${
                  c.author.name
                }(${c.author.userName})`
            )
            .join("\n")}`;
        })
        .join("\n")
    );
  } catch (e) {
    console.error(e);
  }
})();
