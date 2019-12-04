// eslint-disable-next-line no-unused-vars
class ItemsManager {
  constructor() {
    this.storage = browser.storage.local;
    this.runtime = browser.runtime;
    this.sidebar = browser.sidebarAction;
    this.notifications = browser.notifications;
    this.tabs = browser.tabs;

    this.notifications.onClicked.addListener((notificationId) => {
      this.notifications.clear(notificationId);
    });
  }

  addItem(info, tab, type) {
    console.log('Adding new "%s"...', type);
    console.log('tab ->', tab);
    console.log('info ->', info);

    const item = ItemsManager.buildNewItem(info, tab, type);

    return this.storeItem(item)
      .then((newItem) => this.onStoreItemSuccess(newItem))
      .catch((e) => this.onStoreItemError(e, item));
  }

  static buildNewItem(info, tab, type) {
    const {
      title,
      url,
      favIconUrl,
    } = tab;
    const {
      linkText,
      linkUrl,
      mediaType,
      srcUrl,
      selectionText,
    } = info;

    const item = {
      type,
      page: {
        title,
        url,
        iconUrl: favIconUrl,
      },
      link: {
        text: linkText,
        url: linkUrl,
      },
      media: {
        type: mediaType,
        src: srcUrl,
      },
      text: {
        selection: selectionText,
      },
      createdOn: Date.now(),
    };

    return item;
  }

  storeItem(item) {
    return this.storage.get()
      .then(({ lastId, items }) => {
        const newItem = {
          ...item,
          id: lastId,
        };

        return this.storage.set({
          items: { ...items, [lastId]: newItem },
          lastId: lastId + 1,
        })
          .then(() => newItem);
      });
  }

  sendMessage(msg) {
    this.runtime.sendMessage(msg);
  }

  isSideBarOpen() {
    return this.sidebar.isOpen({});
  }

  notifyUser(message) {
    this.notifications.create({
      type: 'basic',
      title: 'Readme!',
      message,
      iconUrl: browser.extension.getURL('icons/readme-96.png'),
    });
  }

  onStoreItemSuccess(item) {
    console.info('New "%s" stored!', item.type, item);

    this.sendMessage({ action: 'add-item', item });

    this.isSideBarOpen().then((isOpen) => {
      if (!isOpen) {
        this.notifyUser(`Added new ${item.type} to your reading list!`);
      }
    });
  }

  onStoreItemError(error, item) {
    console.error('Error storing new item!', item);
    console.error(error);

    this.notifyUser(`💥 Error while adding new ${item.type}!`);
  }

  clearItems() {
    return this.storage.clear()
      .then(() => this.storage.set({ items: {}, lastId: 0 }))
      .then(() => this.onClearSuccess())
      .catch((e) => this.onClearError(e));
  }

  onClearSuccess() {
    console.info('All items cleared!');

    this.sendMessage({ action: 'clear-all-items' });

    this.isSideBarOpen().then((isOpen) => {
      if (!isOpen) {
        this.notifyUser('Your reading list has been cleared!');
      }
    });
  }

  onClearError(error) {
    console.error('Error clearing all items!');
    console.error(error);
    this.notifyUser('💥 Error while clearing your reading list!');
  }

  addAllPageItems(tab, type) {
    console.log('Adding all page "%s"s...', type);
    console.log('tab ->', tab);

    return this.executeScriptInTab(tab, type)
      .then(([pageItems]) => {
        const items = pageItems.map((item) => ItemsManager.buildNewItem(item, tab, type));
        return this.storeAllItems(items);
      })
      .then((newItems) => this.onStoreAllItemsSuccess(type, newItems))
      .catch((e) => this.onStoreAllItemsError(e, type));
  }

  executeScriptInTab(tab, itemType) {
    return this.tabs.executeScript(tab.id, {
      code: ItemsManager.buildQueryCode(itemType),
    });
  }

  static buildQueryCode(type) {
    switch (type) {
      case 'link':
        return ItemsManager.buildQueryLinksCode();

      case 'image':
        return ItemsManager.buildQueryImagesCode();

      default:
        console.warn('Unknown query code type "%s"!', type);
        return '';
    }
  }

  static buildQueryLinksCode() {
    return `
      (() => {
        const itemElements = Array.from(document.querySelectorAll('a:not([href$="#"])'));
        return itemElements.filter((el) => el.href).map((el) => ({
          linkText: el.innerText,
          linkUrl: el.href,
        }));
      })();
    `;
  }

  static buildQueryImagesCode() {
    return `
      (() => {
        const itemElements = Array.from(document.querySelectorAll('img[src]'));
        return itemElements.filter((el) => el.src).map((el) => ({
          mediaType: 'image',
          srcUrl: el.src,
        }));
      })();
    `;
  }

  storeAllItems(allItems) {
    return this.storage.get()
      .then(({ lastId, items }) => {
        const allNewItems = allItems.reduce((acc, newItem, i) => ({
          ...acc,
          [lastId + i]: { ...newItem, id: lastId + i },
        }), items);

        return this.storage.set({
          items: allNewItems,
          lastId: lastId + allNewItems.length,
        })
          .then(() => allNewItems);
      });
  }

  onStoreAllItemsSuccess(type, items) {
    console.info('%d new "%s" items stored!', Object.keys(items).length, type, items);

    this.sendMessage({ action: 'add-all-items', items });

    this.isSideBarOpen().then((isOpen) => {
      if (!isOpen) {
        this.notifyUser(`Added ${items.length} new ${type}s to your reading list!`);
      }
    });
  }

  onStoreAllItemsError(error, type) {
    console.error('Error storing all "%s" items!', type);
    console.error(error);

    this.notifyUser(`💥 Error while adding all page ${type}s!`);
  }
}
