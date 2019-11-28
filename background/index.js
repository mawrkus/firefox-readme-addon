function init() {
  browser.storage.local.get()
    .then((data) => console.log('Local storage', data));

  createMenu({
    id: 'readme-add-link',
    title: browser.i18n.getMessage('saveLink'),
    contexts: [
      'link',
    ],
  });
  createMenu({
    id: 'readme-add-image',
    title: browser.i18n.getMessage('saveImage'),
    contexts: [
      'image',
    ],
  });
  createMenu({
    id: 'readme-add-text',
    title: browser.i18n.getMessage('saveText'),
    contexts: [
      'selection',
    ],
  });

  browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case 'readme-add-link':
        addItem(info, tab, 'link');
        break;

      case 'readme-add-image':
        addItem(info, tab, 'image');
        break;

      case 'readme-add-text':
        addItem(info, tab, 'text');
        break;

      default:
        break;
    }
  });
}

init();
