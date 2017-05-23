'use strict';

const fsJetpack = require('fs-jetpack');
const pjson = require('../package.json');

let banner = `
/*
 * ${pjson.name} v${pjson.version}
 * (c) ${new Date().getFullYear()} @Johnny Wu
 * Released under the MIT License.
 */
`;

let dest = './dist';
let file = 'vfx';
let moduleName = 'vfx';

// clear directory
fsJetpack.dir(dest, { empty: true });

module.exports = {
  entry: './index.js',
  targets: [
    { dest: `${dest}/${file}.dev.js`, format: 'iife' },
    { dest: `${dest}/${file}.js`, format: 'cjs' },
  ],
  moduleName,
  banner,
  external: [
    'memop',
    'vmath',
    'scene-graph',
  ],
  globals: {
    'memop': 'window.memop',
    'vmath': 'window.vmath',
    'scene-graph': 'window.sgraph',
  },
  sourceMap: true,
};