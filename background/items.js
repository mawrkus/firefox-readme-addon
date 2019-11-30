function buildNewItem(info, tab, type) {
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

function onStoreSuccess(item) {
  console.info('New "%s" stored!', item.type, item);

  browser.runtime.sendMessage({
    action: 'add-item',
    item,
  });

  browser.sidebarAction.isOpen({}).then((isOpen) => {
    if (!isOpen) {
      browser.notifications.create({
        type: 'basic',
        title: 'Readme!',
        message: `Added new ${item.type} to your reading list!`,
        iconUrl: browser.extension.getURL('icons/readme-96.png'),
      });
    }
  });
}

function onStoreError(error, item) {
  console.error('Error storing new item!', item);
  console.error(error);

  browser.notifications.create({
    type: 'basic',
    title: 'Readme!',
    message: `💥 Error while adding new ${item.type}!`,
    iconUrl: browser.extension.getURL('icons/readme-96.png'),
  });
}

function storeItem(newItem) {
  return browser.storage.local
    .get()
    .then(({ lastId, items }) => {
      newItem.id = lastId;

      return browser.storage.local
        .set({
          items: { ...items, [newItem.id]: newItem },
          lastId: newItem.id + 1,
        });
    });
}

function addItem(info, tab, type) {
  console.log('Adding new "%s"...', type);
  console.log('tab ->', tab);
  console.log('info ->', info);

  const item = buildNewItem(info, tab, type);

  return storeItem(item)
    .then(() => onStoreSuccess(item))
    .catch((e) => onStoreError(e, item));
}

function buildQueryCode(type) {
  return `
    (() => {
      const itemElements = Array.from(document.querySelectorAll(\'a:not([href$="#"])\'));
      return itemElements.filter((el) => el.href).map((el) => ({
        linkText: el.innerText,
        linkUrl: el.href,
      }));
    })();
  `;
}

function onClearAllSuccess(type, items)  {
  console.info('All items cleared!');

  browser.runtime.sendMessage({
    action: 'clear-all-items',
  });

  browser.sidebarAction.isOpen({}).then((isOpen) => {
    if (!isOpen) {
      browser.notifications.create({
        type: 'basic',
        title: 'Readme!',
        message: 'Your reading list has been cleared!',
        iconUrl: browser.extension.getURL('icons/readme-96.png'),
      });
    }
  });
}

function onClearAllError(error) {
  console.error('Error clearing all items!',);
  console.error(error);

  browser.notifications.create({
    type: 'basic',
    title: 'Readme!',
    message: '💥 Error while clearing your reading list!',
    iconUrl: browser.extension.getURL('icons/readme-96.png'),
  });
}

function clearAllItems() {
  return browser.storage.local.clear()
    .then(() => browser.storage.local.set({ lastId: 0, items: [] })
      .then(() => onClearAllSuccess())
      .catch((e) => onClearAllError(e)));
}

function onStoreAllSuccess(type, items)  {
  console.info('%d new "%s" items stored!', items.length, type);

  browser.runtime.sendMessage({
    action: 'add-all-items',
    items,
  });

  browser.sidebarAction.isOpen({}).then((isOpen) => {
    if (!isOpen) {
      browser.notifications.create({
        type: 'basic',
        title: 'Readme!',
        message: `Added ${items.length} new ${type}s to your reading list!`,
        iconUrl: browser.extension.getURL('icons/readme-96.png'),
      });
    }
  });
}

function onStoreAllError(error, type, items) {
  console.error('Error storing %d new "%s" items!', items.length, type);
  console.error(error);

  browser.notifications.create({
    type: 'basic',
    title: 'Readme!',
    message: `💥 Error while adding ${items.length} new ${type}s!`,
    iconUrl: browser.extension.getURL('icons/readme-96.png'),
  });
}

function storeAllItems(newItems) {
  return browser.storage.local
    .get()
    .then(({ lastId, items }) => {
      const allItems = newItems.reduce((acc, newItem, i) => {
        newItem.id = lastId + i;
        acc[newItem.id] = newItem;
        return acc;
      }, items);

      return browser.storage.local
        .set({
          items: allItems,
          lastId: lastId + newItems.length,
        });
    });
}

function addAllPageItems(tab, type) {
  console.log('Adding all page "%s"s...', type);
  console.log('tab ->', tab);

  browser.tabs.executeScript(tab.id, { code: buildQueryCode(type) })
    .then(([pageItems]) => {
      const items = pageItems.map((item) => buildNewItem(item, tab, type));

      return storeAllItems(items)
        .then(() => onStoreAllSuccess(type, items))
        .catch((e) => onStoreAllError(e, type, items));
    })
    .catch(console.error);
}

browser.notifications.onClicked.addListener((notificationId) => {
  browser.notifications.clear(notificationId);
});
