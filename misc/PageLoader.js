export default class PageLoader {
  constructor() {
    const pageReq = {
      ...require.context('../pages/', true, /\.page\.js$/i),
      ...require.context('../components/', true, /\.page\.js$/i),
    };
    this.pageInstances = pageReq.keys().map((key) => {
      const page = pageReq(key).default;
      if (!page || !(page instanceof Page)) return null;
      return page;
    });
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
