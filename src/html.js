// @ts-check

import cheerio from 'cheerio';

const tagAndResourceAttributeMapping = { img: 'src', link: 'href', script: 'src' };

export const getSourceLinks = (html, origin) => {
  const $ = cheerio.load(html);
  return Object.entries(tagAndResourceAttributeMapping)
    .map(([tag, resAttr]) => {
      const elements = $(tag);
      const links = elements.map((i, el) => $(el).attr(resAttr));
      return links.toArray();
    })
    // @ts-ignore
    .flat(1)
    .filter((url) => {
      const { href } = new URL(url, origin);
      return href.match(new RegExp(origin));
    });
};

export const replaceSrcLinksOnFilePaths = (html, origin, makeFilePathByUrl) => {
  const $ = cheerio.load(html);
  Object.entries(tagAndResourceAttributeMapping)
    .forEach(([tag, resAttr]) => {
      $(tag).each((i, el) => {
        const link = $(el).attr(resAttr);
        const { href } = new URL(link, origin);
        const isLinkToOriginHost = href.match(new RegExp(origin));
        if (isLinkToOriginHost) {
          const filepath = makeFilePathByUrl(link, origin);
          $(el).attr(resAttr, filepath);
        }
      });
    });
  return $.html();
};
