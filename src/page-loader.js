// @ts-check

import path from 'path';
import Listr from 'listr';
import { httpGet, mkdir, writeFile } from './log.js';
import { makeDirNameByUrl, makeFileNameByUrl } from './name.js';
import { getSourceLinks, replaceSrcLinksOnFilePaths } from './html.js';

const downloadSourceFiles = (url, outputDir, html) => {
  const { origin } = new URL(url);
  const sourceLinks = getSourceLinks(html, origin);
  const tasks = new Listr(sourceLinks.map((link) => {
    const { href } = new URL(link, origin);
    const srcDirName = makeDirNameByUrl(url, origin);
    const filename = makeFileNameByUrl(link, origin);
    const filepath = path.join(outputDir, srcDirName, filename);
    return {
      title: filename,
      task: () => httpGet(href).then(({ data }) => writeFile(filepath, data)),
    };
  }));
  return tasks.run();
};

const downloadIndexFile = (url, outputDir, html) => {
  const { origin } = new URL(url);
  const filename = makeFileNameByUrl(url, origin);
  const filepath = path.join(outputDir, filename);
  const updatedHtml = replaceSrcLinksOnFilePaths(html, origin, (link) => {
    const srcDirName = makeDirNameByUrl(url, origin);
    return path.join(srcDirName, makeFileNameByUrl(link, origin));
  });
  return writeFile(filepath, updatedHtml);
};

const loadPage = (url, outputDir) => httpGet(url).then((response) => {
  const html = response.data;
  const indexFilePath = path.join(outputDir, makeFileNameByUrl(url));
  const srcDirPath = path.join(outputDir, makeDirNameByUrl(url));
  return mkdir(srcDirPath)
    .then(() => downloadSourceFiles(url, outputDir, html))
    .then(() => downloadIndexFile(url, outputDir, html))
    .then(() => console.log(`Page was successfully downloaded into ${indexFilePath}`));
});

export default loadPage;
