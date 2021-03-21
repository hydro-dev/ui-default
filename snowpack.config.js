const httpProxy = require('http-proxy');

const proxy = httpProxy.createServer({ target: 'http://localhost:2333' });

module.exports = {
  entry: 'hydro.js',
  plugins: [],
  alias: { vj: __dirname },
  routes: [
    {
      src: '/.*',
      dest: (req, res) => proxy.web(req, res),
      match: 'routes',
    },
  ],
};
