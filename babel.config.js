module.exports = {
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['./build/plugins/babel-plugin-provide', {
      provides: {
        $: 'jquery',
        jQuery: 'jquery',
      },
      modules: [],
    }],
  ],
  presets: [
    ['@babel/preset-env', { loose: true, modules: false }],
    '@babel/preset-react',
  ],
};
