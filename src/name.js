// @ts-check

import _ from 'lodash';
import path from 'path';

export const makeFileNameByUrl = (url, base = null) => {
  const normalizedBase = base === null ? _.noop() : base;
  const { origin, pathname } = new URL(url, normalizedBase);
  const extname = path.extname(pathname);
  const str = [
    origin.replace(/http:\/\/|https:\/\//gm, ''),
    pathname.replace(extname, ''),
  ].join('-');
  return `${_.kebabCase(str)}${extname}`;
};

export const makeDirNameByUrl = (url, base = null) => {
  const normalizedBase = base === null ? _.noop() : base;
  const { origin, pathname } = new URL(url, normalizedBase);
  const extname = path.extname(pathname);
  const str = [
    origin.replace(/http:\/\/|https:\/\//gm, ''),
    pathname.replace(extname, ''),
  ].join('-');
  return `${_.kebabCase(str)}_files`;
};
