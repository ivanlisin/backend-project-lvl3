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

const spaceMap = {
  httpGet: 'httpGet  ',
  mkdir: 'mkdir    ',
  writeFile: 'writeFile',
};

export const httpGet = (url) => wrapWithLog(
  axios.get,
  [url],
  () => `${spaceMap.httpGet} ${url} ok`,
  (err) => `${spaceMap.httpGet} ${url} ${err.message}`,
);

export const mkdir = (dirpath) => wrapWithLog(
  fs.mkdir,
  [dirpath],
  () => `${spaceMap.mkdir} ${dirpath} ok`,
  (err) => `${spaceMap.mkdir} ${dirpath} ${err.message}`,
);

export const writeFile = (filepath, data) => wrapWithLog(
  fs.writeFile,
  [filepath, data],
  () => `${spaceMap.writeFile} ${filepath} ok`,
  (err) => `${spaceMap.writeFile} ${filepath} ${err.message}`,
);
