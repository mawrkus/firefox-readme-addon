function buildNewItem(info, tab) {
  const { title, url } = tab;
  const {
    linkText,
    linkUrl,
    selectionText,
    mediaType,
    srcUrl,
  } = info;

  const item = {
    page: {
      title,
      url,
    },
    link: {
      text: linkText,
      url: linkUrl,
    },
    selection: {
      text: selectionText,
    },
    media: {
      type: mediaType,
      src: srcUrl,
    },
    createdOn: Date.now(),
  };

  return item;
}

function onSaveSuccess(item) {
  console.info('New item added!', item);

  browser.runtime.sendMessage(item);

  browser.notifications.create({
    type: 'basic',
    title: 'Readme!',
    message: '👌🏾 Added new item to your reading list!',
    iconUrl: browser.extension.getURL('icons/readme-48.png'),
  });
}

function onSaveError(error, item) {
  console.error('Error adding new item!', item);
  console.error(error);

  browser.notifications.create({
    type: 'basic',
    title: 'Readme!',
    message: '💥 Error while adding new item to your reading list!',
    iconUrl: browser.extension.getURL('icons/readme-48.png'),
  });
}

function addItem(info, tab) {
  console.log('Adding new item...');
  console.log('info ->', info);
  console.log('tab ->', tab);

  const item = buildNewItem(info, tab);

  browser.storage.local.get()
    .then((data) => browser.storage.local.set({
      items: [...(data.items || []), item],
    }))
    .then(() => onSaveSuccess(item))
    .catch((e) => onSaveError(e, item));
}
