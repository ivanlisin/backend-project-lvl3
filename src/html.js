// @ts-check

import cheerio from 'cheerio';
import { makeFilePathByUrl } from './name';

const tagAndResourceAttributeMapping = { img: 'src', link: 'href', script: 'src' };

const isCorrectLink = (url, asset) => {
  const hasLink = typeof asset === 'string';
  if (!hasLink) {
    return false;
  }

  const { origin } = new URL(url);
  const { href } = new URL(asset, origin);

  const isLinkToOriginHost = href.includes(origin);
  if (!isLinkToOriginHost) {
    return false;
  }

  return true;
};

export default (url, html) => {
  const assets = [];
  const $ = cheerio.load(html);
  Object.entries(tagAndResourceAttributeMapping)
    .forEach(([tag, resAttr]) => {
      $(tag).each((i, el) => {
        const asset = $(el).attr(resAttr);
        if (isCorrectLink(url, asset)) {
          assets.push(asset);
          const filepath = makeFilePathByUrl('', url, asset);
          $(el).attr(resAttr, filepath);
        }
      });
    });
  const updatedHtml = $.html();
  return { updatedHtml, assets };
};
