/* eslint-disable import/no-extraneous-dependencies */
import { argv } from 'yargs';
import fs from 'fs';
import root from './utils/root';
import runGulp from './runGulp';
import runWebpack from './runWebpack';

async function main() {
  const dir = process.cwd();
  process.chdir(root());
  await runGulp({});
  await runWebpack(argv);
  const file = fs.readFileSync(root('public/vj4.css')).toString();
  fs.writeFileSync(
    root('public/vj4.css'),
    file
      .replace(/\/\.\/ui\/iconfont/g, 'ui/iconfont')
      .replace(/\/ui\/iconfont/g, 'ui/iconfont')
      .replace(/\/misc\/icons/g, 'misc/icons')
  );
  process.chdir(dir);
}

module.exports = main;
