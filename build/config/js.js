/* eslint-disable import/no-extraneous-dependencies */
import webpack from 'webpack';
import fs from 'fs';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import mapWebpackUrlPrefix from '../utils/mapWebpackUrlPrefix';
import root from '../utils/root';

const beautifyOutputUrl = mapWebpackUrlPrefix([
  { prefix: 'node_modules/katex/dist/', replace: './katex/' },
  { prefix: 'misc/.iconfont', replace: './ui/iconfont' },
]);

export default function (env = {}) {
  function eslintLoader() {
    return {
      loader: 'eslint-loader',
      options: { configFile: root('.eslintrc.js') },
    };
  }

  function babelLoader() {
    let cacheDirectory = root('.cache/babel');
    try {
      fs.ensureDirSync(cacheDirectory);
    } catch (ignored) {
      cacheDirectory = false;
    }
    return {
      loader: 'babel-loader',
      options: {
        ...require(root('package.json')).babelForProject, // eslint-disable-line
        cacheDirectory,
      },
    };
  }

  function cssLoader() {
    return {
      loader: 'css-loader',
      options: { importLoaders: 1 },
    };
  }

  function postcssLoader() {
    return {
      loader: 'postcss-loader',
      options: { sourceMap: env.production },
    };
  }

  function fileLoader() {
    return {
      loader: 'file-loader',
      options: { name: '[path][name].[ext]?[sha1:hash:hex:10]' },
    };
  }

  const config = {
    bail: true,
    mode: env.production ? 'production' : 'development',
    profile: true,
    context: root(),
    entry: {
      hydro: './hydro.js',
    },
    output: {
      path: root('public'),
      publicPath: '/', // overwrite in entry.js
      hashFunction: 'sha1',
      hashDigest: 'hex',
      hashDigestLength: 10,
      filename: '[name].js?[chunkhash]',
      chunkFilename: '[name].chunk.js?[chunkhash]',
    },
    resolve: {
      modules: [root('node_modules')],
      alias: { vj: root() },
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules[/\\]/,
          enforce: 'pre',
          use: [eslintLoader()],
        },
        {
          // fonts and images
          test: /\.(svg|ttf|eot|woff|woff2|png|jpg|jpeg|gif)$/,
          use: [fileLoader()],
        },
        {
          // ES2015 scripts
          test: /\.js$/,
          exclude: /node_modules[/\\]/,
          use: [babelLoader()],
        },
        {
          test: /\.css$/,
          use: [cssLoader(), postcssLoader()],
        },
      ],
    },
    optimization: {
      splitChunks: {
        minChunks: 2,
      },
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        katex: 'katex/dist/katex.js',
        React: 'react',
      }),
      new FriendlyErrorsPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new CopyWebpackPlugin({
        patterns: [
          { from: root('static') },
          { from: root('node_modules/emojify.js/dist/images/basic'), to: 'img/emoji/' },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: env.production ? '"production"' : '"debug"',
        },
      }),
      ...env.production
        ? [
          new OptimizeCssAssetsPlugin(),
          new webpack.optimize.ModuleConcatenationPlugin(),
          new webpack.LoaderOptionsPlugin({ minimize: true }),
          new webpack.HashedModuleIdsPlugin(),
        ]
        : [new webpack.NamedModulesPlugin()],
      new webpack.LoaderOptionsPlugin({
        options: {
          context: root(),
          customInterpolateName: (url) => beautifyOutputUrl(url),
        },
      }),
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['cpp', 'csharp', 'java', 'javascript', 'python', 'rust', 'ruby', 'php', 'pascal', 'go'],
      }),
    ],
  };

  return config;
}
