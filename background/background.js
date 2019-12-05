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
    const menusManager = new MenusManager({ itemsManager });
    menusManager.createMenus(Object.keys(data.items).length);
  });
