function renderTitles(item, title) {
  const { page, createdOn } = item;
  return `
    <h1 class="title is-5 mb-xs">
      <a href="${page.url}" target="_blank" class="has-text-dark" title="Visit page">
        <strong>${page.title}</strong>
      </a>
    </h1>
    <p>
      <small>${new Date(createdOn).toUTCString()}</small>
    </p>
  `;
}

function renderLink(item) {
  const { page, link, createdOn } = item;
  return `
    <article class="media mb-s">
      <div class="media-content">
        <div class="content">
          ${renderTitles(item)}
          <p>
            <small>🔗</small> <a href="${link.url}" target="_blank" title="${link.url}">${link.text}</a>
          </p>
        </div>
      </div>
      <div class="media-right">
        <button class="delete js-delete"></button>
      </div>
    </article>
    <div class="is-divider"></div>
  `;
}

function renderImage(item) {
  const { page, media, createdOn } = item;
  return `
    <article class="media mb-s">
      <div class="media-content">
        <div class="content">
          ${renderTitles(item)}
          <a href="${media.src}" target="_blank" title="${media.src}">
            <figure class="image">
              <img src="${media.src}" />
            </figure>
          </a>
        </div>
      </div>
      <div class="media-right">
        <button class="delete js-delete"></button>
      </div>
    </article>
    <div class="is-divider"></div>
  `;
}

function renderText(item) {
  const { page, text, createdOn } = item;
  return `
    <article class="media mb-s">
      <div class="media-content">
        <div class="content">
          ${renderTitles(item)}
          <blockquote title="Quote from ${page.url}">${text.selection}</blockquote>
        </div>
      </div>
      <div class="media-right">
        <button class="delete js-delete"></button>
      </div>
    </article>
    <div class="is-divider"></div>
  `;
}

function renderUnknownItemType(item) {
  const { page, createdOn } = item;

  return `
    <article class="media mb-s">
      <div class="media-content">
        <div class="content">
          <p>
            <a href="${page.url}" target="_blank" class="has-text-dark" title="Visit page">
              <strong>${page.title}</strong>
            </a>
            <br>
            <small>${new Date(createdOn).toUTCString()}</small>
            <br>
            <code>${JSON.stringify(item)}</code>
          </p>
        </div>
      </div>
      <div class="media-right">
        <button class="delete js-delete"></button>
      </div>
    </article>
    <div class="is-divider"></div>
  `;
}

function renderItem(item) {
  const { type } = item;

  if (type === 'link') {
    return renderLink(item);
  }
  if (type === 'image') {
    return renderImage(item);
  }
  if (type === 'text') {
    return renderText(item);
  }

  return renderUnknownItemType(item);
}

function sortItems(items) {
  return items.sort((i1, i2) => i2.createdOn - i1.createdOn);
}

function onClickDelete(event, item) {
  const deleteElement = event.target;
  if (!deleteElement.classList.contains('js-delete')) {
    return;
  }

  console.log('Removing item...', item);

  event.preventDefault();

  browser.storage.local.get()
    .then((data) => {
      delete data.items[item.id];
      return browser.storage.local.set(data).then((isCleared) => {
        console.log('Storage cleared?', isCleared, data);
        return data;
      });
    })
    .then((data) => {
      const itemElement = deleteElement.closest('.item');
      itemElement.parentNode.removeChild(itemElement);

      if (!Object.keys(data.items).length) {
        document.getElementById('msg').classList.remove('is-hidden');
      }
    });
}

function createItemElement(item) {
  const itemElement = document.createElement('li');
  itemElement.setAttribute('class', 'item');
  itemElement.innerHTML = renderItem(item);
  itemElement.onclick = (e) => onClickDelete(e, item);
  return itemElement;
}

console.log('Initializing popup script...');

const list = {
  listElement: document.getElementById('reading-list'),
  msgElement: document.getElementById('msg'),

  render(data = { items: [] }) {
    console.log('Rendering list...', data);
    const items = Object.values(data.items);
    const hasItems = items.length > 0;

    this.msgElement.classList.toggle('is-hidden', hasItems);
    this.listElement.innerHTML = '';

    if (hasItems) {
      this.renderItems(items);
    }
  },

  renderItems(items) {
    sortItems(items).forEach((item) => {
      const itemElement = createItemElement(item);
      this.listElement.appendChild(itemElement);
    });
  },

  prependItem(item) {
    this.listElement.prepend(createItemElement(item));
    this.msgElement.classList.add('is-hidden');
  }
};

browser.storage.local.get().then((data) => {
  list.render(data);

  browser.runtime.onMessage.addListener(({ item }) => {
    list.prependItem(item);
  });
});
