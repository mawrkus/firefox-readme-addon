function init() {
  browser.storage.local.get()
    .then((data) => console.log('Local storage', data));

  createMenu({
    id: 'readme-add-link',
    title: browser.i18n.getMessage('saveLink'),
    contexts: [
      'link',
    ],
    onclick(info, tab) {
      addItem(info, tab, 'link');
    }
  });

  createMenu({
    id: 'readme-add-image',
    title: browser.i18n.getMessage('saveImage'),
    contexts: [
      'image',
    ],
    onclick(info, tab) {
      addItem(info, tab, 'image');
    }
  });

  createMenu({
    id: 'readme-add-text',
    title: browser.i18n.getMessage('saveText'),
    contexts: [
      'selection',
    ],
    onclick(info, tab) {
      addItem(info, tab, 'text');
    }
  });
}

init();
