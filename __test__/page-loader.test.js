// @ts-check

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import loadPage from '../src/page-loader';

let tmpdir;
let url;
let filepaths;

const defineTmpDir = async () => {
  const dirpath = path.join(os.tmpdir(), 'page-loader-');
  tmpdir = await fs.mkdtemp(dirpath);
};

const getConfig = async (configName) => {
  const fixtureFilePath = path.join('__fixtures__', configName);
  const data = await fs.readFile(fixtureFilePath, 'utf-8');
  return JSON.parse(data);
};

const turnOnNock = async () => {
  const nockConfig = await getConfig('nock-config.json');
  const promises = nockConfig.map(async ({ urlbase, urlpath, filepath }) => {
    const data = await fs.readFile(filepath, 'utf-8');
    nock(urlbase).get(urlpath).reply(200, data);
  });
  await Promise.all(promises);
};

const definePageLoaderTestData = async () => {
  const pageLoaderConfig = await getConfig('page-loader-config.json');
  url = pageLoaderConfig.url;
  filepaths = pageLoaderConfig.filepaths;
};

beforeAll(async () => {
  await defineTmpDir();
  await turnOnNock();
  await definePageLoaderTestData();
  await loadPage(url, tmpdir);
});

test('match actual and expected direcory size', async () => {
  const actualStat = await fs.stat(tmpdir);
  const expectedDir = path.join('__fixtures__', 'expected-dir');
  const expectedStat = await fs.stat(expectedDir);
  expect(actualStat.size).toBe(expectedStat.size);
});

const readExpectedFile = async (filepath) => {
  const fixtureFilePath = path.join('__fixtures__', 'expected-dir', filepath);
  return fs.readFile(fixtureFilePath, 'utf-8');
};

test('match actual and expected files', async () => {
  const promises = filepaths.map(async (filepath) => {
    const actualFile = path.join(tmpdir, filepath);
    const actual = await fs.readFile(actualFile, 'utf-8');
    const expected = await readExpectedFile(filepath);
    expect(actual).toBe(expected);
  });
  await Promise.all(promises);
});
