// @ts-check

import axios from 'axios';
import addToLog from './log.js';

const get = (url) => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (err) {
    const message = `Incorrect url: ${url}`;
    addToLog(message);
    err.message = message;
    return Promise.resolve(err);
  }
  return axios.get(url)
    .then((response) => {
      const message = `Request received. url: ${url}`;
      addToLog(message);
      return response;
    })
    .catch((err) => {
      const message = `${err.message.replace('Error: ', '')}. url: ${url}`;
      addToLog(message);
      // eslint-disable-next-line no-param-reassign
      err.message = message;
      throw err;
    });
};

export default {
  get,
};
