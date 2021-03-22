const httpProxy = require('http-proxy');

const proxy = httpProxy.createServer({ target: 'http://localhost:2333' });
const dest = (req, res) => proxy.web(req, res, undefined, (e) => console.error(e.message));

module.exports = {
  entry: 'hydro.js',
  env: process.env,
  packageOptions: {
    env: process.env,
    external: ['fs'],
  },
  plugins: [
    ['./build/plugins/require.context', { input: ['misc/PageLoader.js'] }],
  ],
  alias: { vj: __dirname },
  routes: [
    ['/.*', 'routes'],
    ['.+\\.(png|css|json|woff2|woff|ttf)', 'all'],
    ['(/ui-constants\\.js|/locale/.*)', 'all'],
  ].map(([src, match]) => ({ src, match, dest })),
};
