import { Page } from './Page';

export default class PageLoader {
  constructor() {
    const pages = require.context('../pages/', true, /\.page\.jsx?$/i);
    const components = require.context('../components/', true, /\.page\.jsx?$/i);
    this.pageInstances = [
      ...pages.keys().map((key) => {
        const page = pages(key).default;
        if (!page || !(page instanceof Page)) return null;
        return page;
      }),
      ...components.keys().map((key) => {
        const page = components(key).default;
        if (!page || !(page instanceof Page)) return null;
        return page;
      }),
    ];
    window.Hydro.pageInstances = this.pageInstances;
  }

  getAutoloadPages() {
    const pages = this.pageInstances.filter((page) => page && page.autoload);
    return pages;
  }

  getNamedPage(pageName) {
    const pages = this.pageInstances.filter((page) => page && page.isNameMatch(pageName));
    if (pages.length > 0) {
      if (pages.length > 1) {
        console.warn(`Multiple instance for ${pageName}`);
      }
      return pages[0];
    }
    return null;
  }
}
