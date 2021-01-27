import path from 'path';
import { promises as fs } from 'fs';
import { makeDirNameByUrl, makeFileNameByUrl } from '../src/name';
import { getSourceLinks, replaceSrcLinksOnFilePaths } from '../src/html';

const url = 'https://ru.hexlet.io/courses';
const sourceLinks = [
  '/assets/application.css',
  '/assets/professions/nodejs.png',
  '/courses',
  'https://ru.hexlet.io/packs/js/runtime.js',
];

const readFixtureFile = async (...pathSegments) => {
  const fixtureFilePath = path.join('__fixtures__', ...pathSegments);
  return fs.readFile(fixtureFilePath, 'utf-8');
};

test('get source links from html', async () => {
  const html = await readFixtureFile('index.html');
  const { origin } = new URL(url);
  const actual = getSourceLinks(html, origin);
  const expected = sourceLinks;
  expect(actual.sort()).toEqual(expected.sort());
});

test('replace src links on filepaths', async () => {
  const html = await readFixtureFile('index.html');
  const { origin } = new URL(url);
  const makeFilePathByUrl = (innerUrl) => {
    const srcDir = makeDirNameByUrl(url, origin);
    return path.join(srcDir, makeFileNameByUrl(innerUrl, origin));
  };
  const expected = await readFixtureFile('expected-dir', 'ru-hexlet-io-courses.html');
  expect(replaceSrcLinksOnFilePaths(html, origin, makeFilePathByUrl)).toEqual(expected);
});
