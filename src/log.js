// @ts-check

import debug from 'debug';
import axios from 'axios';
import { promises as fs } from 'fs';

const addToLog = debug('page-loader');

const wrapWithLog = (callback, args, makeOkMessage, makeFailMessage) => callback(...args)
  .then((data) => {
    addToLog(makeOkMessage(data));
    return data;
  })
  .catch((err) => {
    addToLog(makeFailMessage(err));
    throw new Error(err);
  });

const shortenPath = (pathToEl) => {
  const segments = pathToEl.split('/').filter((s) => s !== '');
  for (let i = 0; i < 6; i += 1) {
    segments.shift();
  }
  return segments.join('/');
};

const spaceMap = {
  httpGet: 'httpGet  ',
  mkdir: 'mkdir    ',
  writeFile: 'writeFile',
};

export const httpGet = (url) => wrapWithLog(
  axios.get,
  [url],
  () => `${spaceMap.httpGet} ${url} ok`,
  (err) => `${spaceMap.httpGet}   ${url} ${err.message}`,
);

export const mkdir = (dirpath) => wrapWithLog(
  fs.mkdir,
  [dirpath],
  () => `${spaceMap.mkdir} ${shortenPath(dirpath)} ok`,
  (err) => `${spaceMap.mkdir} ${shortenPath(dirpath)} ${err.message}`,
);

export const writeFile = (filepath, data) => wrapWithLog(
  fs.writeFile,
  [filepath, data],
  () => `${spaceMap.writeFile} ${shortenPath(filepath)} ok`,
  (err) => `${spaceMap.writeFile} ${shortenPath(filepath)} ${err.message}`,
);
