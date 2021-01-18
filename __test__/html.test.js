import path from 'path';
import { promises as fs } from 'fs';
import { extractLinks } from '../src/html';

const readFixtureFile = async (filepath) => {
  const fixtureFilePath = path.join('__fixtures__', filepath);
  return fs.readFile(fixtureFilePath, 'utf-8');
};

test('get links from html', async () => {
  const data = await readFixtureFile('index.html');
  const { url, srcLinks: expected } = JSON.parse(await readFixtureFile('page-loader-config.json'));
  const { origin } = new URL(url);
  const actual = extractLinks(data, origin);
  expect(actual.sort()).toEqual(expected.sort());
});
