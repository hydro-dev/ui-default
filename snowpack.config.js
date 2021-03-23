const httpProxy = require('http-proxy');

const proxy = httpProxy.createServer({ target: 'http://localhost:2333' });
const dest = (req, res) => proxy.web(req, res, undefined, (e) => console.error(e.message));

module.exports = {
  entry: 'hydro.js',
  env: process.env,
  plugins: [
    ['./build/plugins/require-context.snowpack', { input: ['misc/PageLoader.js'] }],
    './build/plugins/babel.snowpack',
    './build/plugins/provide.snowpack',
  ],
  alias: { vj: __dirname },
  routes: [
    ['/.*', 'routes'],
    ['.+\\.(png|css|json|woff2|woff|ttf)', 'all'],
    ['(/ui-constants\\.js|/locale/.*)', 'all'],
  ].map(([src, match]) => ({ src, match, dest })),
};
