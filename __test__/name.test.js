import { makeFileNameByUrl, makeDirNameByUrl, makeFilePathByUrl } from '../src/name';

test.each([
  ['https://ru.hexlet.io/', '/assets/application.css', 'ru-hexlet-io-assets-application.css'],
  ['https://ru.hexlet.io/', '/assets/professions/nodejs.png', 'ru-hexlet-io-assets-professions-nodejs.png'],
  ['https://ru.hexlet.io/', '/packs/js/runtime.js', 'ru-hexlet-io-packs-js-runtime.js'],
  ['http://yandex.ru/', null, 'yandex-ru.html'],
])('makeFileNameByUrl with %s', (url, asset, expected) => {
  expect(makeFileNameByUrl(url, asset)).toBe(expected);
});

test.each([
  ['https://ru.hexlet.io/courses', 'ru-hexlet-io-courses_files'],
  ['http://yandex.ru/', 'yandex-ru_files'],
])('makeDirNameByUrl with %s', (url, expected) => {
  expect(makeDirNameByUrl(url)).toBe(expected);
});

test.each([
  ['https://ru.hexlet.io/courses', '/assets/application.css', 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css'],
  ['http://yandex.ru/', null, 'yandex-ru.html'],
])('makeFilePathByUrl with %s', (url, asset, expected) => {
  expect(makeFilePathByUrl('', url, asset)).toBe(expected);
});
