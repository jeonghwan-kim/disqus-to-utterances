import { buildDisqusXml } from "../../test/genrate";
import { activeThread, xmlToJson } from "../disqus";

test("xmlToJson()", async () => {
  const actual = await xmlToJson(buildDisqusXml());
  expect(actual.thread instanceof Array).toBeTruthy();
  expect(actual.thread[0]).toStrictEqual({
    $: {
      "dsq:id": expect.any(String),
    },
    author: [
      {
        isAnonymous: [expect.any(String)],
        name: [expect.any(String)],
        username: [expect.any(String)],
      },
    ],
    createdAt: [expect.any(String)],
    isClosed: [expect.any(String)],
    isDeleted: [expect.any(String)],
    link: [expect.any(String)],
    title: [expect.any(String)],
  });

  expect(actual.post instanceof Array).toBeTruthy();
  expect(actual.post[0]).toStrictEqual({
    $: {
      "dsq:id": expect.any(String),
    },
    author: [
      {
        isAnonymous: [expect.any(String)],
        name: [expect.any(String)],
        username: [expect.any(String)],
      },
    ],
    createdAt: [expect.any(String)],
    isDeleted: [expect.any(String)],
    isSpam: [expect.any(String)],
    message: [expect.any(String)],
    thread: [
      {
        $: {
          "dsq:id": expect.any(String),
        },
      },
    ],
  });
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
