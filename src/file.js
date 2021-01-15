import _ from 'lodash';
import path from 'path';

const converUrlToKebabCase = (url, base = null, extname = '') => {
  const normalizedBase = base === null ? _.noop() : base;
  return new URL(url, normalizedBase).href
    .replace(/.+:\/\//, '')
    .replace(/\/$/, '')
    .replace(extname, '')
    .replace(/[^a-zA-Z0-9]+\b/gm, '-');
};

export const makeFileNameByUrl = (url, base = null) => {
  const extname = path.extname(url);
  const basename = converUrlToKebabCase(url, base, extname);
  return extname === ''
    ? `${basename}.html`
    : `${basename}${extname}`;
};

export const makeDirNameByUrl = (url, base = null) => {
  const dirname = converUrlToKebabCase(url, base);
  return `${dirname}_files`;
};
