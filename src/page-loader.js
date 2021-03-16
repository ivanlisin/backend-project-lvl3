// @ts-check

import debug from 'debug';
import { load, downloadAssets, savePage } from './helpers.js';
import processAssetsLinks from './html.js';

const log = debug('page-loader');

const loadPage = (url, outputDir) => {
  log('Start app', url, outputDir);
  return load(url)
    .then((html) => {
      log('Process html and get assets links');
      const { updatedHtml, assets } = processAssetsLinks(url, html);

      log('Download assets');
      return downloadAssets(url, outputDir, assets)
        .then(() => Promise.resolve(updatedHtml));
    })
    .then((updatedHtml) => {
      log('Save page');
      return savePage(url, outputDir, updatedHtml);
    });
};

export default loadPage;
