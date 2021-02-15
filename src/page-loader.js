// @ts-check

import path from 'path';
import { httpGet, mkdir, writeFile } from './log.js';
import { makeDirNameByUrl, makeFileNameByUrl } from './name.js';
import { getSourceLinks, replaceSrcLinksOnFilePaths } from './html.js';

const downloadSourceFiles = (url, outputDir, html) => {
  const { origin } = new URL(url);
  const srcDirName = makeDirNameByUrl(url, origin);
  const srcDirPath = path.join(outputDir, srcDirName);
  return mkdir(srcDirPath).then(() => {
    const sourceLinks = getSourceLinks(html, origin);
    const promises = sourceLinks.map((link) => {
      const { href } = new URL(link, origin);
      const filename = makeFileNameByUrl(link, origin);
      const filepath = path.join(outputDir, srcDirName, filename);
      return httpGet(href)
        .then(({ data }) => writeFile(filepath, data));
    });
    return Promise.all(promises);
  });
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

const loadPage = async (url, outputDir) => httpGet(url)
  .then((response) => {
    const html = response.data;
    const promises = [
      downloadSourceFiles,
      downloadIndexFile,
    ].map((fn) => fn(url, outputDir, html));
    // @ts-ignore
    return Promise.all(promises);
  });

export default loadPage;
