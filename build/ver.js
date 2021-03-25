const { writeFileSync } = require('fs');
const { argv } = require('yargs');
const pkg = require('../package.json');

if (argv.dev) pkg.version += '-dev';
else pkg.version = pkg.version.replace('-dev', '');

writeFileSync('../package.json', JSON.stringify(pkg, null, 2));
