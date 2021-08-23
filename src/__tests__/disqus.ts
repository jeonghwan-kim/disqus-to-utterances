import { buildDisqusXml } from "../../test/genrate";
import { activeThread, xmlToJson } from "../disqus";

test("xmlToJson()", async () => {
  const actual = await xmlToJson(buildDisqusXml());
  expect(actual.thread instanceof Array).toBeTruthy();
  expect(actual.thread).toMatchInlineSnapshot(`
Array [
  Object {
    "$": Object {
      "dsq:id": "8100051760",
    },
    "author": Array [
      Object {
        "isAnonymous": Array [
          "false",
        ],
        "name": Array [
          "김정환",
        ],
        "username": Array [
          "jeong_hwan_kim",
        ],
      },
    ],
    "createdAt": Array [
      "2016-02-05T12:17:30Z",
    ],
    "isClosed": Array [
      "false",
    ],
    "isDeleted": Array [
      "false",
    ],
    "link": Array [
      "http://jeonghwan-kim.github.io/oh-my-zsh%eb%a1%9c-%ed%84%b0%eb%af%b8%eb%84%90-%ea%be%b8%eb%af%b8%ea%b8%b0/",
    ],
    "title": Array [
      "Oh My Zsh로 터미널 꾸미기",
    ],
  },
]
`);

  expect(actual.post instanceof Array).toBeTruthy();
  expect(actual.post).toMatchInlineSnapshot(`
Array [
  Object {
    "$": Object {
      "dsq:id": "5492538734",
    },
    "author": Array [
      Object {
        "isAnonymous": Array [
          "false",
        ],
        "name": Array [
          "bohaesoju",
        ],
        "username": Array [
          "bohaesoju",
        ],
      },
    ],
    "createdAt": Array [
      "2021-08-13T07:08:48Z",
    ],
    "isDeleted": Array [
      "false",
    ],
    "isSpam": Array [
      "false",
    ],
    "message": Array [
      "<p>Node 버전에 따라서 항상 node-sass 에서 에러가 발생하였는데 그 이유가 있었네요</p>",
    ],
    "thread": Array [
      Object {
        "$": Object {
          "dsq:id": "8100051760",
        },
      },
    ],
  },
]
`);
});

test("activeThread()", async () => {
  const disqus = await xmlToJson(buildDisqusXml());
  const actual = disqus.thread.filter(activeThread);

  expect(
    actual.every(
      (thread) =>
        thread.isDeleted[0] === "false" && thread.isClosed[0] === "false"
    )
  ).toBe(true);
});
