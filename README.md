# disqus-to-utternaces

## Description

I've been using disqus as a blog commenting service for the past few years.
However, after the free trial period, ads started appearing on the disqus service, and I hated seeing ads on my blog.

I came across the [utternaces](https://github.com/utterance/utterances) project while looking for alternatives to the comment system.
It was a way to manage comments as Github issues.
I thought I'd be able to take the lead in my blog comments.
Without ads, of course.

Disqus service provides a function to download comments as an xml backup file.
It is the job of this tool to register this file as a Github issue.

## Prerequisite

Make sure you have these ready

- [Disqus backup file(xml)](https://help.disqus.com/en/articles/1717164-comments-export)
- [node.js](https://nodejs.org/en/)
- [Github personal access token(repo scope)](https://github.com/settings/tokens)

## How to use it

Firstly clone this repository.

```
git clone https://github.com/jeonghwan-kim/disqus-to-utterances.git
```

And move to repository and install dependencies.

```
cd disqus-to-utternaces
npm i
```

Then you can create github issue from disqus backup file.

```
npm start [disqus-backup-file.xml]
```

## Refereneces

- https://jeonghwan-kim.github.io/dev/2021/08/31/disqus-to-utterances.html
