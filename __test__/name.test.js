import { makeFileNameByUrl, makeDirNameByUrl } from '../src/name';

test.each([
  ['/assets/application.css', 'https://ru.hexlet.io/', 'ru-hexlet-io-assets-application.css'],
  ['/assets/professions/nodejs.png', 'https://ru.hexlet.io/', 'ru-hexlet-io-assets-professions-nodejs.png'],
  ['/packs/js/runtime.js', 'https://ru.hexlet.io/', 'ru-hexlet-io-packs-js-runtime.js'],
  ['http://yandex.ru/', null, 'yandex-ru'],
])('makeFileNameByUrl with %s', (url, base, expected) => {
  expect(makeFileNameByUrl(url, base)).toBe(expected);
});

test.each([
  ['https://ru.hexlet.io/courses', null, 'ru-hexlet-io-courses_files'],
  ['/courses', 'https://ru.hexlet.io/', 'ru-hexlet-io-courses_files'],
  ['http://yandex.ru/', null, 'yandex-ru_files'],
])('makeDirNameByUrl with %s', (url, base, expected) => {
  expect(makeDirNameByUrl(url, base)).toBe(expected);
});
