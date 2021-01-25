import path from 'path';
import { promises as fs } from 'fs';
import cheerio from 'cheerio';
import { makeDirNameByUrl, makeFileNameByUrl } from '../src/name';
import { getSourceLinks, replaceSrcLinksOnFilePaths } from '../src/html';

const readFixtureFile = async (filepath) => {
  const fixtureFilePath = path.join('__fixtures__', filepath);
  return fs.readFile(fixtureFilePath, 'utf-8');
};

test('get source links from html', async () => {
  const data = await readFixtureFile('index.html');
  const { url, srcLinks: expected } = JSON.parse(await readFixtureFile('page-loader-config.json'));
  const { origin } = new URL(url);
  const actual = getSourceLinks(data, origin);
  expect(actual.sort()).toEqual(expected.sort());
});

const getHtml = async (...pathSegments) => {
  const filepath = path.join('__fixtures__', ...pathSegments);
  const data = await fs.readFile(filepath, 'utf-8');
  return cheerio.load(data).html();
};

test('replace src links on filepaths', async () => {
  const html = await getHtml('index.html');

  const { url } = JSON.parse(await readFixtureFile('page-loader-config.json'));
  const { origin } = new URL(url);
  const expected = await getHtml('expected-dir', 'ru-hexlet-io-courses.html');

  const srcDir = makeDirNameByUrl(url, origin);
  const makeFilePathByUrl = (innerUrl) => path.join(srcDir, makeFileNameByUrl(innerUrl, origin));

  expect(replaceSrcLinksOnFilePaths(html, origin, makeFilePathByUrl)).toEqual(expected);
});
