const onMenuCreated = (id) => () => {
  if (browser.runtime.lastError) {
    console.log(`Error while creating menu item: ${browser.runtime.lastError}`);
  } else {
    console.log('Menu item "%s" created successfully.', id);
  }
};

function createMenu(menu) {
  browser.menus.create(menu, onMenuCreated(menu.id));
}

function updateClearAllState({ items }) {
  const itemsCount = items.newValue ? Object.keys(items.newValue).length : 0;
  browser.menus.update('readme-clear-all', { enabled: itemsCount > 0 });
}

function createMenus(itemsManager, itemsCount) {
  createMenu({
    id: 'readme-add-link',
    title: browser.i18n.getMessage('addLink'),
    contexts: [
      'link',
    ],
    onclick(info, tab) {
      itemsManager.addItem(info, tab, 'link');
    },
  });

  createMenu({
    id: 'readme-add-image',
    title: browser.i18n.getMessage('addImage'),
    contexts: [
      'image',
    ],
    onclick(info, tab) {
      itemsManager.addItem(info, tab, 'image');
    },
  });

  createMenu({
    id: 'readme-add-text',
    title: browser.i18n.getMessage('addText'),
    contexts: [
      'selection',
    ],
    onclick(info, tab) {
      itemsManager.addItem(info, tab, 'text');
    },
  });

  createMenu({
    id: 'readme-add-all-links',
    title: browser.i18n.getMessage('addAllLinks'),
    contexts: [
      'page',
    ],
    onclick(info, tab) {
      itemsManager.addAllPageItems(tab, 'link');
    },
  });

  createMenu({
    id: 'readme-add-all-images',
    title: browser.i18n.getMessage('addAllImages'),
    contexts: [
      'page',
    ],
    onclick(info, tab) {
      itemsManager.addAllPageItems(tab, 'image');
    },
  });

  createMenu({
    id: 'readme-sep1',
    type: 'separator',
    contexts: [
      'all',
    ],
  });

  createMenu({
    id: 'readme-clear-all',
    title: browser.i18n.getMessage('clearAll'),
    enabled: itemsCount > 0,
    contexts: [
      'all',
    ],
    onclick() {
      itemsManager.clearItems();
    },
  });

  browser.storage.onChanged.addListener(updateClearAllState);
}

console.log('Initializing background script...');

browser.storage.local.get()
  .then((data) => {
    console.log('Storage', data);

    if (!data.items) {
      data.items = {}; // eslint-disable-line no-param-reassign
      data.lastId = 0; // eslint-disable-line no-param-reassign
      return browser.storage.local.set(data).then(() => data);
    }

    return data;
  })
  .then((data) => {
    const itemsManager = new ItemsManager();
    createMenus(itemsManager, Object.keys(data.items).length);
  });
