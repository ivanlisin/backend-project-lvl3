import cheerio from 'cheerio';

const tagAndResourceAttributeMapping = { img: 'src', link: 'href', script: 'src' };

// eslint-disable-next-line import/prefer-default-export
export const extractLinks = (data, origin) => {
  const $ = cheerio.load(data);
  return Object.entries(tagAndResourceAttributeMapping)
    .map(([tag, resAttr]) => $(tag).map((i, el) => $(el).attr(resAttr)).toArray())
    .flat(1)
    .filter((url) => {
      const { href } = new URL(url, origin);
      return href.match(new RegExp(origin));
    });
};
