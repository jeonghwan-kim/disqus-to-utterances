import faker from "faker";
import {
  buildAuthorXml,
  buildDisqusXml,
  buildPostXml,
  buildThreadXml,
} from "../../test/genrate";
import { convert } from "../convert";
import { dateFormat } from "../helpers";

function ready() {
  const fakeThreadId = faker.datatype.uuid();
  const fakeThreadLink = faker.internet.url();
  const fakeThreadTitle = faker.name.title();
  const fakeThreadCreatedAt = dateFormat(faker.date.recent().toISOString());
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

test.todo("conver: 이슈를 시간 역순으로 정렬한다");
test.todo("conver: 댓글 없는 이슈는 제외한다");
test.todo("conver: 중복 타이틀이 있는 이슈는 하나로 병합한다");
