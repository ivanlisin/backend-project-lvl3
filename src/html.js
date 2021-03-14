// @ts-check

import cheerio from 'cheerio';
import path from 'path';
import { makeFileNameByUrl, makeDirNameByUrl } from './name';

const tagAndResourceAttributeMapping = { img: 'src', link: 'href', script: 'src' };

export default (url, html) => {
  const { origin } = new URL(url);
  const assets = [];
  const $ = cheerio.load(html);
  Object.entries(tagAndResourceAttributeMapping)
    .forEach(([tag, resAttr]) => {
      $(tag).each((i, el) => {
        const link = $(el).attr(resAttr);
        const { href } = new URL(link, origin);
        const hasLink = typeof link === 'string';
        const isLinkToOriginHost = href.includes(origin);
        if (hasLink && isLinkToOriginHost) {
          assets.push(link);
          const dirname = makeDirNameByUrl(url);
          const filename = makeFileNameByUrl(url, link);
          const filepath = path.join(dirname, filename);
          $(el).attr(resAttr, filepath);
        }
      });
    });
  const updatedHtml = $.html();
  return { updatedHtml, assets };
};
