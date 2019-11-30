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

function createMenus() {
  createMenu({
    id: 'readme-add-link',
    title: browser.i18n.getMessage('addLink'),
    contexts: [
      'link',
    ],
    onclick(info, tab) {
      addItem(info, tab, 'link');
    }
  });

  createMenu({
    id: 'readme-add-image',
    title: browser.i18n.getMessage('addImage'),
    contexts: [
      'image',
    ],
    onclick(info, tab) {
      addItem(info, tab, 'image');
    }
  });

  createMenu({
    id: 'readme-add-text',
    title: browser.i18n.getMessage('addText'),
    contexts: [
      'selection',
    ],
    onclick(info, tab) {
      addItem(info, tab, 'text');
    }
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

createMenus();
