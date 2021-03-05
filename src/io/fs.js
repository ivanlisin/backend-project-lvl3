// @ts-check

import { promises as fs } from 'fs';
import path from 'path';
import addToLog from './log.js';

const mkdir = (dirpath) => fs.mkdir(dirpath)
  .then(() => {
    const message = `Directory created. dirpath: ${dirpath}`;
    addToLog(message);
  })
  .catch((err) => {
    if (err.message.includes('ENOENT: no such file or directory, mkdir')) {
      const message = `No such directory. access to ${path.dirname(dirpath)}`;
      addToLog(message);
      // eslint-disable-next-line no-param-reassign
      err.message = message;
      throw err;
    }
    if (err.message.includes('EEXIST: file already exists, mkdir')) {
      const message = `Dir already exists. dirpath: ${dirpath}`;
      addToLog(message);
      // eslint-disable-next-line no-param-reassign
      err.message = message;
      throw err;
    }
    addToLog(err.message);
    throw err;
  });

const writeFile = (filepath, data) => fs.writeFile(filepath, data)
  .then(() => {
    const message = `File created. filepath: ${filepath}`;
    addToLog(message);
  })
  .catch((err) => {
    addToLog(err.message);
    throw err;
  });

export default {
  mkdir,
  writeFile,
};
