const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const serialize = require('serialize-javascript');
const nunjucks = require('nunjucks');
const { filter } = require('lodash');
const { argv } = require('yargs');
const Xss = require('xss');
const markdown = require('./markdown');

const { misc, buildContent } = global.Hydro.lib;

const xss = new Xss.FilterXSS({
  whiteList: {
    a: ['target', 'href', 'title'],
    abbr: ['title'],
    address: [],
    area: ['shape', 'coords', 'href', 'alt'],
    article: [],
    aside: [],
    audio: ['autoplay', 'controls', 'loop', 'preload', 'src'],
    b: [],
    bdi: ['dir'],
    bdo: ['dir'],
    big: [],
    blockquote: ['cite'],
    br: [],
    caption: [],
    center: [],
    cite: [],
    code: [],
    col: ['align', 'valign', 'span', 'width'],
    colgroup: ['align', 'valign', 'span', 'width'],
    dd: [],
    del: ['datetime'],
    details: ['open'],
    div: [],
    dl: [],
    dt: [],
    em: [],
    font: ['color', 'size', 'face'],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    header: [],
    hr: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    ins: ['datetime'],
    li: [],
    mark: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    section: [],
    small: [],
    span: ['class'],
    sub: [],
    sup: [],
    strong: [],
    table: ['width', 'border', 'align', 'valign'],
    tbody: ['align', 'valign'],
    td: ['width', 'rowspan', 'colspan', 'align', 'valign'],
    tfoot: ['align', 'valign'],
    th: ['width', 'rowspan', 'colspan', 'align', 'valign'],
    thead: ['align', 'valign'],
    tr: ['rowspan', 'align', 'valign'],
    tt: [],
    u: [],
    ul: [],
    video: ['autoplay', 'controls', 'loop', 'preload', 'src', 'height', 'width'],
  },
});

class Loader extends nunjucks.Loader {
  // eslint-disable-next-line class-methods-use-this
  getSource(name) {
    if (!argv.template) {
      if (!global.Hydro.ui.template[name]) throw new Error(`Cannot get template ${name}`);
      return {
        src: global.Hydro.ui.template[name],
        path: name,
        noCache: false,
      };
    }
    let fullpath = null;
    const p = path.resolve(process.cwd(), argv.template, name);
    if (fs.existsSync(p)) fullpath = p;
    if (!fullpath) throw new Error(`Cannot get template ${name}`);
    return {
      src: fs.readFileSync(fullpath, 'utf-8').toString(),
      path: fullpath,
      noCache: true,
    };
  }
}

class Nunjucks extends nunjucks.Environment {
  constructor() {
    super(new Loader(), { autoescape: true, trimBlocks: true });
    this.addFilter('json', (self) => JSON.stringify(self));
    this.addFilter('parseYaml', (self) => yaml.load(self));
    this.addFilter('dumpYaml', (self) => yaml.dump(self));
    this.addFilter('xss', (self) => xss.process(self));
    this.addFilter('serialize', (self, ignoreFunction = true) => serialize(self, { ignoreFunction }));
    this.addFilter('assign', (self, data) => Object.assign(self, data));
    this.addFilter('markdown', (self, html = false) => markdown.render(self, html));
    this.addFilter('markdownInline', (self, html = false) => markdown.renderInline(self, html));
    this.addFilter('ansi', (self) => misc.ansiToHtml(self));
    this.addFilter('base64_encode', (s) => Buffer.from(s).toString('base64'));
    this.addFilter('bitand', (self, val) => self & val);
    this.addFilter('toString', (self) => (typeof self === 'string' ? self : JSON.stringify(self)));
    this.addFilter('content', (content, language, html) => {
      let s = '';
      try {
        s = JSON.parse(content);
      } catch {
        s = content;
      }
      if (typeof s === 'object' && !(s instanceof Array)) {
        if (s[language]) s = s[language];
        else s = s[Object.keys(s)[0]];
      }
      if (s instanceof Array) s = buildContent(s, html ? 'html' : 'markdown', (str) => str.translate(language));
      return html ? xss.process(s) : markdown.render(s);
    });
    this.addFilter('log', (self) => {
      console.log(self);
      return self;
    });
  }
}
nunjucks.runtime.memberLookup = function memberLookup(obj, val) {
  if ((obj || {})._original) obj = obj._original;
  if (obj === undefined || obj === null) return undefined;
  if (typeof obj[val] === 'function') {
    const fn = function () {
      // eslint-disable-next-line
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        // eslint-disable-next-line prefer-rest-params
        args[_key2] = arguments[_key2];
      }
      // eslint-disable-next-line block-scoped-var
      return obj[val].call(obj, ...args);
    };
    fn._original = obj[val];
    return fn;
  }
  return obj[val];
};
const env = new Nunjucks();

async function render(name, state) {
  // eslint-disable-next-line no-return-await
  return await new Promise((resolve, reject) => {
    env.render(name, {
      page_name: name.split('.')[0],
      ...state,
      typeof: (o) => typeof o,
      static_url: (assetName) => {
        const cdnPrefix = global.Hydro.model.system.get('server.cdn');
        if (global.Hydro.ui.manifest[assetName]) {
          return `${cdnPrefix}${global.Hydro.ui.manifest[assetName]}`;
        }
        return `${cdnPrefix}${assetName}`;
      },
      findSubModule: (prefix) => {
        filter(Object.keys(global.Hydro.ui.template), (n) => n.startsWith(prefix));
      },
      datetimeSpan: misc.datetimeSpan,
      paginate: misc.paginate,
      perm: global.Hydro.model.builtin.PERM,
      PRIV: global.Hydro.model.builtin.PRIV,
      STATUS: global.Hydro.model.builtin.STATUS,
      size: misc.size,
      gravatar: misc.gravatar,
      model: global.Hydro.model,
      Context: global.Hydro.ui,
      formatJudgeTexts: (texts) => texts.map((text) => {
        if (typeof text === 'string') return text;
        return state._(text.message).format(...text.params || []) + ((argv.debug && text.stack) ? `\n${text.stack}` : '');
      }).join('\n'),
      isIE: (str) => str.includes('MSIE') || str.includes('rv:11.0'),
    }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

module.exports = render;

global.Hydro.lib.template = { render };
