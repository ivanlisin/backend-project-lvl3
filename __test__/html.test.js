import path from 'path';
import _ from 'lodash';
import { promises as fs } from 'fs';
import processAssetsLinks from '../src/html';

const url = 'https://ru.hexlet.io/courses';

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

const assets = [
  '/assets/application.css',
  '/assets/professions/nodejs.png',
  '/courses',
  'https://ru.hexlet.io/packs/js/runtime.js',
];

test('processAssetsLinks 1', () => {
  const data = processAssetsLinks(url, responseIndex);
  expect(data.updatedHtml).toEqual(localIndex);
  expect(data.assets.sort()).toEqual(assets.sort());
});
