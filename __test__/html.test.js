import path from 'path';
import { promises as fs } from 'fs';
import { getSourceLinks, replaceSrcLinksOnFilePaths } from '../src/html';

const url = 'https://ru.hexlet.io/courses';
const { origin } = new URL(url);

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

test('get source links from html', async () => {
  const sourceLinks = [
    '/assets/application.css',
    '/assets/professions/nodejs.png',
    '/courses',
    'https://ru.hexlet.io/packs/js/runtime.js',
  ];
  const actual = getSourceLinks(responseIndex, origin).sort();
  const expected = sourceLinks.sort();
  expect(actual).toEqual(expected);
});

const makeFilePathByUrl = (link) => {
  const srcDirName = 'ru-hexlet-io-courses_files';
  const linkAndFileNameMapping = {
    '/assets/application.css': 'ru-hexlet-io-assets-application.css',
    '/assets/professions/nodejs.png': 'ru-hexlet-io-assets-professions-nodejs.png',
    '/courses': 'ru-hexlet-io-courses.html',
    'https://ru.hexlet.io/packs/js/runtime.js': 'ru-hexlet-io-packs-js-runtime.js',
  };
  const filename = linkAndFileNameMapping[link];
  return path.join(srcDirName, filename);
};

test('replace src links on filepaths', () => {
  const actual = replaceSrcLinksOnFilePaths(responseIndex, origin, makeFilePathByUrl);
  const expected = localIndex;
  expect(actual).toEqual(expected);
});

test('replace src links on filepaths 2', () => {
  const substr = ' href="https://cdn2.hexlet.io/assets/menu.css"';
  const html = responseIndex.replace(substr, '');
  const actual = replaceSrcLinksOnFilePaths(html, origin, makeFilePathByUrl);
  const expected = localIndex.replace(substr, '');
  expect(actual).toEqual(expected);
});
