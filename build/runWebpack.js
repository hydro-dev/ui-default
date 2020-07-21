/* eslint-disable import/no-extraneous-dependencies */
import webpack from 'webpack';
import webpackConfig from './config/webpack';

export default function ({ watch, production }) {
  const compiler = webpack(webpackConfig({ watch, production }));
  return new Promise((resolve, reject) => {
    function compilerCallback(err, stats) {
      if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        reject(err);
      }
      console.log(stats.toString());
      if (!watch && stats.hasErrors()) process.exitCode = 1;
      resolve();
    }
    if (watch) compiler.watch({}, compilerCallback);
    else compiler.run(compilerCallback);
  });
}
