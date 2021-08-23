export const buildThreadXml = () => `
<thread dsq:id="8100051760">
  <link>http://jeonghwan-kim.github.io/oh-my-zsh%eb%a1%9c-%ed%84%b0%eb%af%b8%eb%84%90-%ea%be%b8%eb%af%b8%ea%b8%b0/</link>
  <title>Oh My Zsh로 터미널 꾸미기</title>
  <createdAt>2016-02-05T12:17:30Z</createdAt>
  <author>
    <name>김정환</name>
    <isAnonymous>false</isAnonymous>
    <username>jeong_hwan_kim</username>
  </author>
  <isClosed>false</isClosed>
  <isDeleted>false</isDeleted>
</thread>
`;

export const buildPostXml = () => `
<post dsq:id="5492538734">
  <message><![CDATA[<p>Node 버전에 따라서 항상 node-sass 에서 에러가 발생하였는데 그 이유가 있었네요</p>]]></message>
  <createdAt>2021-08-13T07:08:48Z</createdAt>
  <isDeleted>false</isDeleted>
  <isSpam>false</isSpam>
  <author>
    <name>bohaesoju</name>
    <isAnonymous>false</isAnonymous>
    <username>bohaesoju</username>
  </author>
  <thread dsq:id="8100051760" />
</post>
`;

export const buildDisqusXml = () => `
<?xml version="1.0" encoding="utf-8"?>
<disqus>
  ${buildThreadXml()}
  ${buildPostXml()}
</disqus>
`;
