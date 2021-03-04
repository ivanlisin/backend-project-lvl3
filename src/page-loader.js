// @ts-check

import path from 'path';
import Listr from 'listr';
import { http, fs } from './io/index.js';
import { makeDirNameByUrl, makeFileNameByUrl } from './name.js';
import { getSourceLinks, replaceSrcLinksOnFilePaths } from './html.js';

const downloadSourceFiles = (url, outputDir, html) => {
  const { origin } = new URL(url);
  const sourceLinks = getSourceLinks(html, origin);
  const tasks = new Listr(sourceLinks.map((link) => {
    const srcDirName = makeDirNameByUrl(url, origin);
    const filename = makeFileNameByUrl(link, origin);
    const filepath = path.join(outputDir, srcDirName, filename);
    return {
      title: filename,
      task: () => {
        const { href } = new URL(link, origin);
        return http.get(href).then(({ data }) => fs.writeFile(filepath, data));
      },
    };
  }));
  return tasks.run();
};

const downloadIndexFile = (url, outputDir, html) => {
  const { origin } = new URL(url);
  const updatedHtml = replaceSrcLinksOnFilePaths(html, origin, (link) => {
    const srcDirName = makeDirNameByUrl(url);
    const srcFileName = makeFileNameByUrl(link, origin);
    return path.join(srcDirName, srcFileName);
  });
  const filename = makeFileNameByUrl(url);
  const filepath = path.join(outputDir, filename);
  return fs.writeFile(filepath, updatedHtml);
};

const loadPage = (url, outputDir) => http.get(url).then((response) => {
  const html = response.data;
  const srcDirPath = path.join(outputDir, makeDirNameByUrl(url));
  const indexFilePath = path.join(outputDir, makeFileNameByUrl(url));
  return fs.mkdir(srcDirPath)
    .then(() => downloadSourceFiles(url, outputDir, html))
    .then(() => downloadIndexFile(url, outputDir, html))
    .then(() => console.log(`Page was successfully downloaded into ${indexFilePath}`));
});

export default loadPage;
