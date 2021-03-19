// @ts-check

import debug from 'debug';
import processAssetsLinks from './html.js';
import { loadIndex, downloadAssets, saveIndex } from './helpers.js';
import { makeFileNameByUrl } from './name.js';

const log = debug('page-loader');

const loadPage = (url, outputDir) => {
  log('Start app', url, outputDir);
  return loadIndex(url)
    .then((data) => {
      const html = data.toString();

      log('Load page', html);
      const { updatedHtml, assets } = processAssetsLinks(url, html);

      log('Download assets', assets);
      return downloadAssets(url, outputDir, assets)
        .then(() => updatedHtml);
    })
    .then((updatedHtml) => {
      log('Save page', updatedHtml);
      return saveIndex(url, outputDir, updatedHtml);
    })
    .then(() => {
      const filename = makeFileNameByUrl(url);
      return `Page was successfully downloaded into ${filename}`;
    });
};

export default loadPage;
