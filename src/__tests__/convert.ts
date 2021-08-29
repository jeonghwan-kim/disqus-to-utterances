import dayjs from "dayjs";
import faker from "faker";
import {
  buildDisqusXml,
  buildPostXml,
  buildThreadXml,
} from "../../test/genrate";
import { convert } from "../convert";

function ready() {
  const fakeThreadId = faker.datatype.uuid();
  const fakeThreadLink = faker.internet.url();
  const fakeThreadTitle = faker.name.title();
  const fakeThreadCreatedAt = new Date().toISOString();
  const fakeThreadAuthorName = faker.name.firstName();
  const fakeThreadeAuthorUserName = faker.internet.userAgent();
  const threadXml = [
    buildThreadXml({
      $: { "dsq:id": fakeThreadId },
      title: [fakeThreadTitle],
      createdAt: [fakeThreadCreatedAt],
      link: [fakeThreadLink],
      author: [
        {
          isAnonymous: ["false"],
          name: [fakeThreadAuthorName],
          username: [fakeThreadeAuthorUserName],
        },
      ],
    }),
  ];

  const fakeCommentMessage = faker.lorem.sentences();
  const fakeCommentCreatedAt = faker.date.recent().toISOString();
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

  return {
    fakeThreadId,
    fakeThreadLink,
    fakeThreadTitle,
    fakeThreadCreatedAt,
    fakeThreadAuthorName,
    fakeThreadeAuthorUserName,
    threadXml,

    fakeCommentMessage,
    fakeCommentCreatedAt,
    fakeCommentName,
    fakeCommentUserName,
    postXml,
  };
}

test("convert: 쓰레드와 포스트로 이슈를 만든다", async () => {
  const {
    threadXml,
    postXml,
    fakeThreadId,
    fakeThreadTitle,
    fakeThreadLink,
    fakeCommentName,
    fakeCommentUserName,
    fakeCommentCreatedAt,
    fakeCommentMessage,
    fakeThreadCreatedAt,
    fakeThreadAuthorName,
    fakeThreadeAuthorUserName,
  } = ready();

  const disqusXml = buildDisqusXml({ threadXml, postXml });
  const actual = await convert(disqusXml);
  expect(actual).toStrictEqual([
    {
      postId: fakeThreadId,
      postTitle: fakeThreadTitle,
      postUrl: fakeThreadLink,
      comments: [
        {
          author: {
            isAnonymous: false,
            name: fakeCommentName,
            userName: fakeCommentUserName,
          },
          createdAt: fakeCommentCreatedAt,
          message: fakeCommentMessage,
        },
      ],
      createdAt: fakeThreadCreatedAt,
      postAuthor: {
        isAnonymous: false,
        name: fakeThreadAuthorName,
        userName: fakeThreadeAuthorUserName,
      },
    },
  ]);
});

test("convert: 연관된 커맨트를 이슈에 연결한다", async () => {
  const { threadXml, postXml, fakeCommentMessage } = ready();

  const disqusXml = buildDisqusXml({
    threadXml,
    postXml: [...postXml, buildPostXml()],
  });
  const actual = await convert(disqusXml);

  expect(actual[0].comments.length).toBe(1);
  expect(actual[0].comments[0].message).toBe(fakeCommentMessage);
});

test("conver: 이슈를 시간순으로 정렬한다", async () => {
  const { threadXml, postXml } = ready();
  const extraThreadXmls = [
    buildThreadXml({
      createdAt: [dayjs().subtract(2, "day").toISOString()],
      $: { "dsq:id": "1" },
    }),
    buildThreadXml({
      createdAt: [dayjs().subtract(1, "day").toISOString()],
      $: { "dsq:id": "2" },
    }),
  ];
  const extraPostXmls = [
    buildPostXml({ thread: [{ $: { "dsq:id": "1" } }] }),
    buildPostXml({ thread: [{ $: { "dsq:id": "2" } }] }),
  ];
  const disqusXml = buildDisqusXml({
    threadXml: [...threadXml, ...extraThreadXmls],
    postXml: [...postXml, ...extraPostXmls],
  });

  const issues = await convert(disqusXml);

  issues.reduce((prevTime, issue, index) => {
    const nextTime = new Date(issue.createdAt).getTime();
    expect(prevTime <= nextTime).toBe(true);
    return nextTime;
  }, 0);
});

test("conver: 댓글 없는 이슈는 제외한다", async () => {
  const { threadXml, postXml } = ready();
  const extraThreadXmls = [
    buildThreadXml({
      createdAt: [dayjs().subtract(2, "day").toISOString()],
      $: { "dsq:id": "1" },
    }),
    buildThreadXml({
      createdAt: [dayjs().subtract(1, "day").toISOString()],
      $: { "dsq:id": "2" },
    }),
  ];

  const disqusXml = buildDisqusXml({
    threadXml: [...threadXml, ...extraThreadXmls],
    postXml: [...postXml],
  });

  const issues = await convert(disqusXml);

  expect(issues.length).toBe(threadXml.length);
});

test("conver: 중복 타이틀이 있는 이슈는 하나로 병합한다", async () => {
  const { threadXml, postXml } = ready();
  const extraThreadXmls = [
    buildThreadXml({
      createdAt: [dayjs().subtract(2, "day").toISOString()],
      $: { "dsq:id": "1" },
      title: ["중복 타이틀"],
    }),
    buildThreadXml({
      createdAt: [dayjs().subtract(1, "day").toISOString()],
      title: ["중복 타이틀"],
      $: { "dsq:id": "2" },
    }),
  ];
  const extraPostXmls = [
    buildPostXml({ thread: [{ $: { "dsq:id": "1" } }] }),
    buildPostXml({ thread: [{ $: { "dsq:id": "2" } }] }),
  ];
  const disqusXml = buildDisqusXml({
    threadXml: [...threadXml, ...extraThreadXmls],
    postXml: [...postXml, ...extraPostXmls],
  });

  const issues = await convert(disqusXml);

  expect(issues.length).toBe(threadXml.length + 1);
});
