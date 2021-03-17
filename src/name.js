// @ts-check

import _ from 'lodash';
import path from 'path';

const processUrl = (url, asset = null) => {
  const isItAssetUrl = asset !== null;
  const { origin, pathname } = isItAssetUrl
    ? new URL(asset, url)
    : new URL(url);
  const extname = path.extname(pathname);
  const str = [
    origin.replace(/http:\/\/|https:\/\//gm, ''),
    pathname.replace(extname, ''),
  ].join('-');
  const name = _.kebabCase(str);
  return { extname, name };
};

export const makeFileNameByUrl = (url, asset = null) => {
  const { name, extname } = processUrl(url, asset);
  return extname === ''
    ? `${name}.html`
    : `${name}${extname}`;
};

export const makeDirNameByUrl = (url) => {
  const { name } = processUrl(url);
  return `${name}_files`;
};

export const makeFilePathByUrl = (outputDir, url, asset = null) => {
  const isAsset = asset !== null;
  if (isAsset) {
    const dirname = makeDirNameByUrl(url);
    const filename = makeFileNameByUrl(url, asset);
    return path.join(outputDir, dirname, filename);
  }
  const filename = makeFileNameByUrl(url);
  return path.join(outputDir, filename);
};
