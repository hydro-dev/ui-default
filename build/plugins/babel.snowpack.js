const babel = require('@babel/core');
const { readFile } = require('fs-extra');

module.exports = function () {
  return {
    name: 'babel-jsx-plugin',
    resolve: {
      input: ['.jsx'],
      output: ['.js'],
    },
    async load({ filePath }) {
      const contents = await readFile(filePath, 'utf-8');
      const result = babel.transformSync(contents, {
        plugins: ['@babel/plugin-transform-runtime'],
      });
      return result.code;
    },
  };
};
