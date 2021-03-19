// @ts-check

import axios from 'axios';
import path from 'path';
import Listr from 'listr';
import { promises as fs } from 'fs';
import { makeFileNameByUrl, makeDirNameByUrl, makeFilePathByUrl } from './name.js';

const load = (href) => {
  const options = { responseType: 'arraybuffer' };
  return axios.get(href, options).then(({ data }) => data);
};

const save = (filepath, data) => fs.writeFile(filepath, data, 'utf-8');

export const loadIndex = load;

export const downloadAssets = (url, outputDir, assets) => {
  const hasAssets = assets.length !== 0;
  if (!hasAssets) {
    return Promise.resolve();
  }

  const dirname = makeDirNameByUrl(url);
  const dirpath = path.join(outputDir, dirname);

  const tasks = assets.map((asset) => ({
    title: makeFileNameByUrl(url, asset),
    task: () => {
      const { href } = new URL(asset, url);
      return load(href)
        .then((data) => {
          const filepath = makeFilePathByUrl(outputDir, url, asset);
          return save(filepath, data);
        });
    },
  }));
  const options = { concurrency: true };
  const listr = new Listr(tasks, options);

  return fs.mkdir(dirpath).then(() => listr.run());
};

export const saveIndex = (url, outputDir, html) => {
  const filepath = makeFilePathByUrl(outputDir, url);
  return save(filepath, html).then(() => {
    const filename = makeFileNameByUrl(url);
    console.log(`Page was successfully downloaded into ${filename}`);
  });
};
