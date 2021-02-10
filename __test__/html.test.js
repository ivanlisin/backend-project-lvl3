import path from 'path';
import { promises as fs } from 'fs';
import { getSourceLinks, replaceSrcLinksOnFilePaths } from '../src/html';

const url = 'https://ru.hexlet.io/courses';

const readFixtureFile = async (filename) => {
  const filepath = path.join('__fixtures__', filename);
  const data = await fs.readFile(filepath, 'utf-8');
  return data.trim();
};

test('get source links from html', async () => {
  const sourceLinks = [
    '/assets/application.css',
    '/assets/professions/nodejs.png',
    '/courses',
    'https://ru.hexlet.io/packs/js/runtime.js',
  ];
  const html = await readFixtureFile('response-index.html');
  const { origin } = new URL(url);
  const actual = getSourceLinks(html, origin).sort();
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

test('replace src links on filepaths', async () => {
  const html = await readFixtureFile('response-index.html');
  const { origin } = new URL(url);
  const actual = replaceSrcLinksOnFilePaths(html, origin, makeFilePathByUrl);
  const expected = await readFixtureFile('local-index.html');
  expect(actual).toEqual(expected);
});
