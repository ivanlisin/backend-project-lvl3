#!/usr/bin/env node

// @ts-check

import { program } from 'commander';
import { promises as fs } from 'fs';
import loadPage from '../src/page-loader.js';

(async () => {
  const data = await fs.readFile('package.json', 'utf-8');
  const { description, version } = await JSON.parse(data);

  program
    .arguments('<url>')
    .description(description)
    .version(version)
    .option('--output [dirpath]', 'output directory', '.')
    .action(async (url) => {
      try {
        // @ts-ignore
        loadPage(url, program.output);
      } catch (err) {
        console.log(err.message);
      }
    })
    .parse(process.argv);
})();
