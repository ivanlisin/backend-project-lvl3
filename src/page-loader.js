// @ts-check

import debug from 'debug';
import processAssetsLinks from './html.js';
import { loadIndex, downloadAssets, saveIndex } from './helpers.js';

const log = debug('page-loader');

const loadPage = (url, outputDir) => {
  log('Start app', url, outputDir);
  return loadIndex(url)
    .then((html) => {
      log('Load page', html);
      const { updatedHtml, assets } = processAssetsLinks(url, html);

      log('Download assets', assets);
      return downloadAssets(url, outputDir, assets)
        .then(() => updatedHtml);
    })
    .then((updatedHtml) => {
      log('Save page', updatedHtml);
      return saveIndex(url, outputDir, updatedHtml);
    });
};

export default loadPage;
