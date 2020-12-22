/* eslint-disable camelcase */
const markdown = require('./backendlib/markdown.js');

const { system, domain } = global.Hydro.model;
const { Route, Handler } = global.Hydro.service.server;

class WikiHelpHandler extends Handler {
  async get() {
    this.response.template = 'wiki_help.html';
  }
}

class WikiAboutHandler extends Handler {
  async get() {
    this.response.template = 'about.html';
  }
}

class UiSettingsHandler extends Handler {
  async get({ domainId }) {
    const [
      header_logo, header_logo_2x,
      nav_logo_dark, nav_logo_light,
      nav_logo_dark_2x, nav_logo_light_2x,
      header_background, header_background_2x,
    ] = await system.getMany([
      'ui-default.header_logo', 'ui-default.header_logo_2x',
      'ui-default.nav_logo_dark', 'ui-default.nav_logo_light',
      'ui-default.nav_logo_dark_2x', 'ui-default.nav_logo_light_2x',
      'ui-default.header_background', 'ui-default.header_background2x',
    ]);
    const ddoc = await domain.get(domainId);
    this.response.body = await this.renderHTML('extra.css', {
      header_logo,
      header_logo_2x,
      nav_logo_dark,
      nav_logo_light,
      nav_logo_dark_2x,
      nav_logo_light_2x,
      header_background,
      header_background_2x,
      ...ddoc,
    });
    this.response.type = 'text/css';
    this.ctx.set('nolog', '1');
  }
}

class LocaleHandler extends Handler {
  async get({ id }) {
    // eslint-disable-next-line prefer-destructuring
    id = id.split('.')[0];
    // TODO use language_default setting
    if (!global.Hydro.locales[id]) id = 'en';
    this.response.body = `window.LOCALES=${JSON.stringify(global.Hydro.locales[id])}`;
    this.response.type = 'text/javascript';
    this.ctx.set('nolog', '1');
  }
}

class MarkdownHandler extends Handler {
  async post({ text, html = false, inline = false }) {
    this.response.body = inline
      ? markdown.renderInline(text, html)
      : markdown.render(text, html);
    this.response.type = 'text/html';
  }
}

global.Hydro.handler.ui = async () => {
  Route('wiki_help', '/wiki/help', WikiHelpHandler);
  Route('wiki_about', '/wiki/about', WikiAboutHandler);
  Route('locale', '/locale/:id', LocaleHandler);
  Route('ui_extracss', '/extra.css', UiSettingsHandler);
  Route('markdown', '/markdown', MarkdownHandler);
};
