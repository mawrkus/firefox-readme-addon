function init() {
  browser.storage.local.get()
    .then((data) => console.log('Local storage', data));

  createMenu({
    id: 'readme-add',
    title: browser.i18n.getMessage('addToReadingList'),
    contexts: [
      'image',
      'link',
      'selection',
      // 'video',
    ],
    icons: {
      '16': 'icons/readme.svg',
      '32': 'icons/readme.svg'
    },
  });

  browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case 'readme-add':
        addItem(info, tab);
        break;
    }
  });
}

init();
