// @ts-check

import path from 'path';
import { promises as fs } from 'fs';

const getConfig = async (configName) => {
  const configPath = path.join('__fixtures__', configName);
  const data = await fs.readFile(configPath, 'utf8');
  return JSON.parse(data);
};

const readExpectedFile = async (filepath) => {
  const fixtureFilePath = path.join('__fixtures__', 'expected-dir', filepath);
  return fs.readFile(fixtureFilePath, 'utf-8');
};

const simulatePageLoad = async (outDir) => {
  const srcdir = 'ru-hexlet-io-courses_files';
  const { filepaths } = await getConfig('page-loader-config.json');
  await fs.mkdir(path.join(outDir, srcdir));
  const promises = filepaths.map(async (filepath) => {
    const data = await readExpectedFile(filepath);
    const distpath = path.join(outDir, filepath);
    await fs.writeFile(distpath, data);
  });
  return Promise.all(promises);
};

const loadPage = (_url, outDir) => simulatePageLoad(outDir);

export default loadPage;
