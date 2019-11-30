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

function createMenus(itemsManager) {
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
    contexts: [
      'all',
    ],
    onclick() {
      itemsManager.clearItems();
    },
  });
}

console.log('Initializing background script...');

browser.storage.local.get().then((data) => {
  console.log('Storage', data);
  if (!data.items) {
    data.items = {};
    data.lastId = 0;
    return browser.storage.local.set(data);
  }
});

const itemsManager = new ItemsManager();

createMenus(itemsManager);
