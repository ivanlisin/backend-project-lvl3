// @ts-check

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import loadPage from '../src/page-loader';

const url = 'https://ru.hexlet.io/courses';
let tmpdir;

const defineTmpDir = async () => {
  const dirpath = path.join(os.tmpdir(), 'page-loader-');
  tmpdir = await fs.mkdtemp(dirpath);
};

const turnOnNock = async () => {
  const configPath = path.join('__fixtures__', 'nock-config.json');
  const nockConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  const promises = nockConfig.map(async ({ urlbase, urlpath, filepath }) => {
    const data = await fs.readFile(filepath, 'utf-8');
    nock(urlbase).get(urlpath).reply(200, data);
  });
  await Promise.all(promises);
};

beforeAll(async () => {
  await defineTmpDir();
  await turnOnNock();
  await loadPage(url, tmpdir);
});

test('match actual and expected directory size', async () => {
  const actualStat = await fs.stat(tmpdir);
  const expectedDir = path.join('__fixtures__', 'expected-dir');
  const expectedStat = await fs.stat(expectedDir);
  expect(actualStat.size).toBe(expectedStat.size);
});

const readActualFile = (filepath) => {
  const actualFile = path.join(tmpdir, filepath);
  return fs.readFile(actualFile, 'utf-8');
};

const readExpectedFile = (filepath) => {
  const fixtureFilePath = path.join('__fixtures__', 'expected-dir', filepath);
  return fs.readFile(fixtureFilePath, 'utf-8');
};

test.each([
  ['ru-hexlet-io-courses.html'],
  ['ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css'],
  ['ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png'],
  ['ru-hexlet-io-courses_files/ru-hexlet-io-courses.html'],
  ['ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js'],
])('match actual and expected files: %s', async (filepath) => {
  const actual = await readActualFile(filepath);
  const expected = await readExpectedFile(filepath);
  expect(actual).toBe(expected);
});
