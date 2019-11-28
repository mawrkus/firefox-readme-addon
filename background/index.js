function init() {
  browser.storage.local.get()
    .then((data) => console.log('Local storage', data));

  createMenu({
    id: 'readme-add-link',
    title: 'Add link',
    contexts: [
      'link',
    ],
  });
  createMenu({
    id: 'readme-add-image',
    title: 'Add image',
    contexts: [
      'image',
    ],
  });
  createMenu({
    id: 'readme-add-text',
    title: 'Add selected text',
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
