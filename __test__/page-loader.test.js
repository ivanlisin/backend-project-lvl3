// @ts-check

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import _ from 'lodash';
import loadPage from '../src/page-loader';

const url = 'https://ru.hexlet.io/courses';
let tmpdir;
let expectedSrcDirSize;

const readFixtureFile = async (filename) => {
  const filepath = path.join('__fixtures__', filename);
  const data = await fs.readFile(filepath, 'utf-8');
  return data.trim();
};

const turnOnNock = async () => {
  const { origin, pathname } = new URL(url);

  const data = await readFixtureFile('response-index.html');
  nock(origin).get(pathname).reply(200, data);

  const responceData = 'some data';
  const sourceLinks = [
    '/assets/application.css',
    '/assets/professions/nodejs.png',
    '/courses',
    '/packs/js/runtime.js',
  ];
  expectedSrcDirSize = sourceLinks.length * responceData.length;

  sourceLinks.forEach((link) => {
    const innerData = responceData;
    nock(origin).get(link).reply(200, innerData);
  });
};

beforeAll(async () => {
  tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  await turnOnNock();
  await loadPage(url, tmpdir);
});

test('check index', async () => {
  const indexFileName = 'ru-hexlet-io-courses.html';
  const filepath = path.join(tmpdir, indexFileName);
  const actual = await fs.readFile(filepath, 'utf-8');
  const expected = await readFixtureFile('local-index.html');
  expect(actual).toEqual(expected);
});

test('check source files', async () => {
  const srcDirName = 'ru-hexlet-io-courses_files';
  const expectedSrcFileNames = [
    'ru-hexlet-io-assets-application.css',
    'ru-hexlet-io-assets-professions-nodejs.png',
    'ru-hexlet-io-courses.html',
    'ru-hexlet-io-packs-js-runtime.js',
  ];

  const actualSrcFileNames = await fs.readdir(path.join(tmpdir, srcDirName));
  const actualSrcDirSize = await (async () => {
    const filenames = actualSrcFileNames;
    const filepaths = filenames.map((filename) => path.join(tmpdir, srcDirName, filename));
    const promises = filepaths.map(fs.stat);
    const stats = await Promise.all(promises);
    return _.sumBy(stats.filter((stat) => stat.isFile()), 'size');
  })();

  expect(actualSrcFileNames.sort()).toEqual(expectedSrcFileNames.sort());
  expect(actualSrcDirSize).toBe(expectedSrcDirSize);
});
