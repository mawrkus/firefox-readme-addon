function buildNewItem(info, tab, type) {
  const { title, url } = tab;
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

function onSaveSuccess(item) {
  console.info('New "%s" added!', item.type, item);

  browser.runtime.sendMessage(item);

  browser.sidebarAction.isOpen({})
    .then((isOpen) => {
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

function onSaveError(error, item) {
  console.error('Error adding new item!', item);
  console.error(error);

  browser.notifications.create({
    type: 'basic',
    title: 'Readme!',
    message: `💥 Error while adding new ${item.type}!`,
    iconUrl: browser.extension.getURL('icons/readme-48.png'),
  });
}

function addItem(info, tab, type) {
  console.log('Adding new "%s"...', type);
  console.log('tab ->', tab);
  console.log('info ->', info);

  const item = buildNewItem(info, tab, type);

  browser.storage.local.get()
    .then((data) => browser.storage.local.set({
      items: [...(data.items || []), item],
    }))
    .then(() => onSaveSuccess(item))
    .catch((e) => onSaveError(e, item));
}

browser.notifications.onClicked.addListener((notificationId) => {
  browser.notifications.clear(notificationId);
});
