#!/usr/bin/env node

// @ts-check

import pkg from 'commander';
import { promises as fs } from 'fs';
import loadPage from '../src/page-loader.js';

const { program } = pkg;

(async () => {
  const data = await fs.readFile('package.json', 'utf-8');
  const { description, version } = await JSON.parse(data);

  program
    .arguments('<url>')
    .description(description)
    .version(version)
    .option('-o, --output [dirpath]', 'output directory', '.')
    .action(async (url) => {
      const options = program.opts();
      try {
        // @ts-ignore
        await loadPage(url, options.output);
      } catch (err) {
        console.log(err.message);
      }
    })
    .parse(process.argv);
})();
