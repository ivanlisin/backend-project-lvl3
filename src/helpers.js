// @ts-check

import axios from 'axios';
import path from 'path';
import Listr from 'listr';
import { promises as fs } from 'fs';
import { makeFileNameByUrl, makeDirNameByUrl } from './name';

export const load = (url, asset = null) => {
  let href;
  try {
    const isItLoadAsset = asset !== null;
    const urlObj = isItLoadAsset
      ? new URL(asset, url)
      : new URL(url);
    href = urlObj.href;
  } catch (err) {
    return Promise.reject(err);
  }
  return axios.get(href).then(({ data }) => data);
};

const save = (data, outputDir, url, asset = null) => {
  const isItSaveAsset = asset !== null;
  const segment = isItSaveAsset
    ? path.join(makeDirNameByUrl(url), makeFileNameByUrl(url, asset))
    : path.join(makeFileNameByUrl(url, asset));
  const filepath = path.join(outputDir, segment);
  return fs.writeFile(filepath, data);
};

export const downloadAssets = (url, outputDir, assets) => {
  const hasAssets = assets.length !== 0;
  if (!hasAssets) {
    return Promise.resolve();
  }

  const dirname = makeDirNameByUrl(url);
  const dirpath = path.join(outputDir, dirname);

  const tasks = assets.map((asset) => ({
    title: makeFileNameByUrl(url, asset),
    task: () => load(url, asset)
      .then((data) => save(data, outputDir, url, asset)),
  }));
  const options = { concurrency: true };
  const listr = new Listr(tasks, options);

  return fs.mkdir(dirpath).then(() => listr.run());
};

export const savePage = (url, outputDir, html) => save(html, outputDir, url)
  .then(() => {
    const filename = makeFileNameByUrl(url);
    console.log(`Page was successfully downloaded into ${filename}`);
  });
