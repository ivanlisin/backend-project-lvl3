// @ts-check

import axios from 'axios';
import path from 'path';
import Listr from 'listr';
import { promises as fs } from 'fs';
import { makeFileNameByUrl, makeDirNameByUrl, makeFilePathByUrl } from './name';

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
  const options = { responseType: 'arraybuffer' };
  return axios.get(href, options).then(({ data }) => data);
};

export const save = (url, outputDir, data, asset = null) => {
  const filepath = makeFilePathByUrl(outputDir, url, asset);
  return fs.writeFile(filepath, data, 'utf-8');
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
      .then((data) => save(url, outputDir, data, asset)),
  }));
  const options = { concurrency: true };
  const listr = new Listr(tasks, options);

  return fs.mkdir(dirpath).then(() => listr.run());
};
