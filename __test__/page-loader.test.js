// @ts-check

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import nock from 'nock';
import _ from 'lodash';
import loadPage from '../src/page-loader';

const url = 'https://ru.hexlet.io/courses';
const { origin, pathname } = new URL(url);

let responseIndex;
let localIndex;

const readFixtureFile = async (filename) => {
  const filepath = path.join('__fixtures__', filename);
  const data = await fs.readFile(filepath, 'utf-8');
  return data.trim();
};

beforeAll(async () => {
  responseIndex = await readFixtureFile('response-index.html');
  localIndex = await readFixtureFile('local-index.html');
});

const makeTmpDir = async () => {
  const dirpath = path.join(os.tmpdir(), 'page-loader-');
  return fs.mkdtemp(dirpath);
};

const defaultResCodes = { index: 200, src: [200, 200, 200, 200] };

const turnOnNock = (resCodes = defaultResCodes) => {
  const data = responseIndex;
  nock(origin).get(pathname).reply(resCodes.index, data);

  const sourceLinks = [
    '/assets/application.css',
    '/assets/professions/nodejs.png',
    '/courses',
    '/packs/js/runtime.js',
  ];
  sourceLinks.forEach((link, i) => {
    nock(origin).get(link).reply(resCodes.src[i], 'some data');
  });
};

describe('successful', () => {
  let tmpdir;

  beforeAll(async () => {
    tmpdir = await makeTmpDir();
    turnOnNock();
    await loadPage(url, tmpdir);
  });

  afterAll(() => {
    nock.cleanAll();
  });

  test('check index', async () => {
    const indexFileName = 'ru-hexlet-io-courses.html';
    const filepath = path.join(tmpdir, indexFileName);
    const actual = await fs.readFile(filepath, 'utf-8');
    const expected = localIndex;
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
    const expectedSrcDirSize = 'some data'.length * 4;

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
});

describe('fail', () => {
  let tmpdir;

  let i = 0;
  const customResCodesForTest = {
    2: { index: 400, src: [200, 200, 200, 200] },
    3: { index: 200, src: [500, 200, 200, 200] },
  };
  beforeEach(async () => {
    tmpdir = await makeTmpDir();
    const resCodes = _.has(customResCodesForTest, i)
      ? customResCodesForTest[i]
      : defaultResCodes;
    turnOnNock(resCodes);
    i += 1;
  });

  afterEach(() => {
    nock.cleanAll();
  });

  // 0
  test('wrong url', async () => {
    await expect(loadPage('wrong-url', tmpdir)).rejects.toThrow();
  });

  // 1
  test('not exist output dir', async () => {
    await expect(loadPage(url, 'not-exist-url')).rejects.toThrow();
  });

  // 2
  test('http errors 1', async () => {
    await expect(loadPage(url, tmpdir)).rejects.toThrow();
  });

  // 3
  test('http errors 2', async () => {
    await expect(loadPage(url, tmpdir)).rejects.toThrow();
  });
});
