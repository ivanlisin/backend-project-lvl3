// @ts-check

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import loadPage from '../src/page-loader';

const url = 'https://ru.hexlet.io/courses';

const indexFileName = 'ru-hexlet-io-courses.html';
const srcDirName = 'ru-hexlet-io-courses_files';
const srcLinks = [
  '/assets/application.css',
  '/assets/professions/nodejs.png',
  '/courses',
  '/packs/js/runtime.js',
];
const srcFilePaths = [
  'ru-hexlet-io-assets-application.css',
  'ru-hexlet-io-assets-professions-nodejs.png',
  'ru-hexlet-io-courses.html',
  'ru-hexlet-io-packs-js-runtime.js',
];

let responseIndex;
let localIndex;

let tmpdir;

beforeAll(async () => {
  const readFixtureFile = async (filename) => {
    const filepath = path.join('__fixtures__', filename);
    const data = await fs.readFile(filepath, 'utf-8');
    return data.trim();
  };
  responseIndex = await readFixtureFile('response-index.html');
  localIndex = await readFixtureFile('local-index.html');
});

beforeEach(async () => {
  const makeTmpDir = async () => {
    const dirpath = path.join(os.tmpdir(), 'page-loader-');
    return fs.mkdtemp(dirpath);
  };
  tmpdir = await makeTmpDir();
});

afterEach(() => {
  tmpdir = '';
  nock.cleanAll();
});

const nockSrcData = 'some data';

const turnOnNock = (resCodes = { index: 200, src: [200, 200, 200, 200] }) => {
  const { origin, pathname } = new URL(url);
  const data = responseIndex;
  nock(origin).get(pathname).reply(resCodes.index, data);
  srcLinks.forEach((link, i) => {
    nock(origin).get(link).reply(resCodes.src[i], nockSrcData);
  });
};

test('successful page loading', async () => {
  turnOnNock();
  await loadPage(url, tmpdir);

  const relativeFilePaths = [
    indexFileName,
    ...srcFilePaths.map((filepath) => path.join(srcDirName, filepath)),
  ];
  const promises = relativeFilePaths.map((relativeFilePath) => {
    const absoluteFilePath = path.join(tmpdir, relativeFilePath);
    const actualData = fs.readFile(absoluteFilePath, 'utf-8');
    const expectedData = relativeFilePath === indexFileName
      ? localIndex
      : nockSrcData;
    return expect(actualData).resolves.toEqual(expectedData);
  });
  await Promise.all(promises);
});

test('wrong url', async () => {
  turnOnNock();
  const errorMessage = 'connect ECONNREFUSED 127.0.0.1:80';
  await expect(loadPage('wrong-url', tmpdir)).rejects.toThrow(errorMessage);
});

test('not exist output dir', async () => {
  turnOnNock();
  const errorMessage = "ENOENT: no such file or directory, mkdir 'not-exist-dir/ru-hexlet-io-courses_files'";
  await expect(loadPage(url, 'not-exist-dir')).rejects.toThrow(errorMessage);
});

test(`400 response for ${url}`, async () => {
  turnOnNock({ index: 400, src: [200, 200, 200, 200] });
  const errorMessage = 'Request failed with status code 400';
  await expect(loadPage(url, tmpdir)).rejects.toThrow(errorMessage);
});

const { origin } = new URL(url);
const link = (new URL(srcLinks[0], origin)).href;
test(`500 response for ${link}`, async () => {
  turnOnNock({ index: 200, src: [500, 200, 200, 200] });
  const errorMessage = 'Request failed with status code 500';
  await expect(loadPage(url, tmpdir)).rejects.toThrow(errorMessage);
});

test(`replacing the file ${indexFileName}`, async () => {
  turnOnNock();
  const filepath = path.join(tmpdir, indexFileName);
  await fs.writeFile(filepath, 'data');
  await loadPage(url, tmpdir);
  const actual = await fs.readFile(filepath, 'utf-8');
  const expected = localIndex;
  expect(actual).toEqual(expected);
});

test(`dir ${srcDirName} already exists`, async () => {
  turnOnNock();
  const dirpath = path.join(tmpdir, srcDirName);
  await fs.mkdir(dirpath);
  const errorMessage = `EEXIST: file already exists, mkdir '${dirpath}'`;
  await expect(loadPage(url, tmpdir)).rejects.toThrow(errorMessage);
});
