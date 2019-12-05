// eslint-disable-next-line no-unused-vars
class MenusManager {
  constructor({ itemsManager }) {
    this.itemsManager = itemsManager;
    this.menus = browser.menus;
    this.runtime = browser.runtime;

    browser.storage.onChanged.addListener(this.updateClearAllState.bind(this));
  }

  createMenus(itemsCount) {
    this.createMenu({
      id: 'readme-add-link',
      title: browser.i18n.getMessage('addLink'),
      contexts: [
        'link',
      ],
      onclick: (info, tab) => this.itemsManager.addItem(info, tab, 'link'),
    });

    this.createMenu({
      id: 'readme-add-image',
      title: browser.i18n.getMessage('addImage'),
      contexts: [
        'image',
      ],
      onclick: (info, tab) => this.itemsManager.addItem(info, tab, 'image'),
    });

    this.createMenu({
      id: 'readme-add-text',
      title: browser.i18n.getMessage('addText'),
      contexts: [
        'selection',
      ],
      onclick: (info, tab) => this.itemsManager.addItem(info, tab, 'text'),
    });

    this.createMenu({
      id: 'readme-add-page',
      title: browser.i18n.getMessage('addPage'),
      contexts: [
        'all',
      ],
      onclick: (info, tab) => this.itemsManager.addItem(info, tab, 'page'),
    });

    this.createMenu({
      id: 'readme-sep-1',
      type: 'separator',
    });

    this.createMenu({
      id: 'readme-add-all-links',
      title: browser.i18n.getMessage('addAllLinks'),
      contexts: [
        'all',
      ],
      onclick: (info, tab) => this.itemsManager.addAllPageItems(tab, 'link'),
    });

    this.createMenu({
      id: 'readme-add-all-images',
      title: browser.i18n.getMessage('addAllImages'),
      contexts: [
        'all',
      ],
      onclick: (info, tab) => this.itemsManager.addAllPageItems(tab, 'image'),
    });

    this.createMenu({
      id: 'readme-sep-2',
      type: 'separator',
    });

    this.createMenu({
      id: 'readme-clear-all',
      title: browser.i18n.getMessage('clearAll'),
      enabled: itemsCount > 0,
      contexts: [
        'all',
      ],
      onclick: () => this.itemsManager.clearItems(),
    });
  }

  createMenu(menu) {
    this.menus.create(menu, this.onMenuCreated(menu.id));
  }

  onMenuCreated(id) {
    return () => {
      if (this.runtime.lastError) {
        console.log(`Error while creating menu item: ${this.runtime.lastError}`);
      } else {
        console.log('Menu item "%s" created successfully.', id);
      }
    };
  }

  updateClearAllState({ items }) {
    const itemsCount = items.newValue ? Object.keys(items.newValue).length : 0;
    this.menus.update('readme-clear-all', { enabled: itemsCount > 0 });
  }
}
