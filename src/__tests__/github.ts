import faker from "faker";
import {
  buildDisqusXml,
  buildPostXml,
  buildThreadXml,
} from "../../test/genrate";
import { xmlToJson } from "../disqus";
import {
  attachCommentOnIssue,
  createComment,
  createIssue,
  hasComments,
  issueToString,
  mergeDuplicate,
  sortByCreatedAtAsc,
} from "../github";
import { dateFormat } from "../helpers";

test("createIssue()", async () => {
  const { thread } = await xmlToJson(buildDisqusXml());
  const actual = createIssue(thread[0]);

  expect(actual).toStrictEqual({
    postId: thread[0].$["dsq:id"],
    postUrl: thread[0].link[0],
    postTitle: thread[0].title[0],
    createdAt: thread[0].createdAt[0],
    postAuthor: {
      isAnonymous: JSON.parse(thread[0].author[0].isAnonymous[0]),
      name: thread[0].author[0].name[0],
      userName: thread[0].author[0].username[0],
    },
    comments: [],
  });
});

test("sortByCreatedAtAsc()", async () => {
  const { thread } = await xmlToJson(buildDisqusXml());
  const actual = thread.map(createIssue).sort(sortByCreatedAtAsc);

  actual.reduce((prevDate, item) => {
    expect(prevDate >= new Date(item.createdAt).getTime()).toBe(true);
    return new Date(item.createdAt).getTime();
  }, Date.now());
});

test("attatchCommentOnIssue", async () => {
  const threadId = faker.datatype.uuid();
  const threadXml = [buildThreadXml({ $: { "dsq:id": threadId } })];
  const postXml = [
    buildPostXml({ thread: [{ $: { "dsq:id": threadId } }] }),
    buildPostXml(),
  ];
  const disqusXml = buildDisqusXml({ threadXml, postXml });
  const { thread, post } = await xmlToJson(disqusXml);
  const issue = createIssue(thread[0]);

  const actual = attachCommentOnIssue(issue, post);

  expect(actual.comments.length).toBe(1);
});

test("createComment", async () => {
  const { post } = await xmlToJson(buildDisqusXml());
  const actual = createComment(post[0]);

  expect(actual).toStrictEqual({
    createdAt: post[0].createdAt[0],
    message: post[0].message[0],
    author: {
      isAnonymous: JSON.parse(post[0].author[0].isAnonymous[0]),
      name: post[0].author[0].name[0],
      userName: post[0].author[0].username[0],
    },
  });
});

test("hasComments()", async () => {
  const { thread } = await xmlToJson(buildDisqusXml());
  const issue = createIssue(thread[0]);
  const actual = hasComments(issue);
  expect(actual).toBe(false);
});

test("mergeDuplicate()", async () => {
  const { thread } = await xmlToJson(buildDisqusXml());
  const issues = thread.map(createIssue);
  const actual = mergeDuplicate(issues, issues[0]);
  expect(actual.length).toBe(1);
});

test("issueToString()", async () => {
  const fakeThreadId = faker.datatype.uuid();
  const fakeTitle = faker.name.title();
  const fakeCreatedAt = dateFormat(faker.date.recent().toISOString());
  const threadXml = [
    buildThreadXml({
      $: { "dsq:id": fakeThreadId },
      title: [fakeTitle],
      createdAt: [fakeCreatedAt],
    }),
  ];

  const fakeCommentMessage = faker.lorem.sentences();
  const fakeCommentCreatedAt = dateFormat(faker.date.recent().toISOString());
  const fakeCommentName = faker.name.findName();
  const fakeCommentUserName = faker.internet.userName();
  const postXml = [
    buildPostXml({
      message: [fakeCommentMessage],
      createdAt: [fakeCommentCreatedAt],
      author: [
        {
          name: [fakeCommentName],
          username: [fakeCommentUserName],
          isAnonymous: ["false"],
        },
      ],
      thread: [
        {
          $: { "dsq:id": fakeThreadId },
        },
      ],
    }),
  ];

  const { thread, post } = await xmlToJson(
    buildDisqusXml({ threadXml, postXml })
  );
  const issues = thread.map((thread) =>
    attachCommentOnIssue(createIssue(thread), post)
  );

  const actual = issueToString(issues[0]);

  expect(actual).toMatchInlineSnapshot(`
"${fakeCreatedAt} ${fakeTitle}
  [1] ${fakeCommentMessage.slice(0, 100)}
      ${fakeCommentCreatedAt} ${fakeCommentName}(${fakeCommentUserName})"
`);
});
