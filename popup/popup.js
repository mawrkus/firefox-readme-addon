function renderItemHeader(item) {
  const { page, createdOn } = item;
  return `
    <article class="media">
      <figure class="media-left page-icon">
        <p class="image is-24x24">
          <img src="${page.iconUrl}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <a href="${page.url}" target="_blank" class="has-text-dark" title="Visit page">
            <h1 class="page-title">${page.title}</h1>
          </a>
          <p class="mb-s">
            <small>${new Date(createdOn).toUTCString()}</small>
          </p>
        </div>
      </div>
      <div class="media-right">
        <button class="delete is-small js-delete" title="Remove"></button>
      </div>
    </article>
  `;
}

function renderLink(item) {
  const { link } = item;
  return `
    <div class="container">
      ${renderItemHeader(item)}
      <div class="content ml-xs">
        <small>🔗</small> <a href="${link.url}" target="_blank" title="${link.url}">${link.text || link.url}</a>
      </div>
    </div>
  `;
}

function renderImage(item) {
  const { media } = item;
  return `
    <div class="container">
      ${renderItemHeader(item)}
      <div class="content ml-xs">
        <a href="${media.src}" target="_blank" title="${media.src}">
          <figure class="image">
            <img src="${media.src}" />
          </figure>
        </a>
      </div>
    </div>
  `;
}

function renderText(item) {
  const { page, text } = item;
  return `
    <div class="container">
      ${renderItemHeader(item)}
      <div class="content ml-xs">
        <blockquote title="Quote from ${page.url}">${text.selection}</blockquote>
      </div>
    </div>
  `;
}

function renderPage(item) {
  const { page } = item;
  return `
    <div class="container">
      ${renderItemHeader(item)}
      <div class="content ml-xs">
        <em title="Description of page ${page.url}">${page.metas.description}</em>
      </div>
    </div>
  `;
}

function renderUnknownItemType(item) {
  return `
    <div class="container">
      ${renderItemHeader(item)}
      <div class="content ml-xs">
        <code>${JSON.stringify(item)}</code>
      </div>
    </div>
  `;
}

function renderItem(item) {
  switch (item.type) {
    case 'link':
      return renderLink(item);

    case 'image':
      return renderImage(item);

    case 'text':
      return renderText(item);

    case 'page':
      return renderPage(item);

    default:
      return renderUnknownItemType(item);
  }
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
      delete data.items[item.id]; // eslint-disable-line no-param-reassign
      return browser.storage.local.set(data).then(() => data);
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
  itemElement.innerHTML = `${renderItem(item)}<div class="is-divider"></div>`;
  itemElement.onclick = (e) => onClickDelete(e, item);
  return itemElement;
}

console.log('Initializing popup script...');

const list = {
  listElement: document.getElementById('reading-list'),
  msgElement: document.getElementById('msg'),

  render(data = { items: {}, lastId: 0 }) {
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

  prependItem(item, filters) {
    if (!filters[item.type]) {
      return;
    }
    this.listElement.prepend(createItemElement(item));
    this.msgElement.classList.add('is-hidden');
  },

  prependAllItems(items, filters) {
    Object.values(items).forEach((item) => this.prependItem(item, filters));
  },

  filterAndRender(filters) {
    const filterFn = (item) => filters[item.type] && filters.searchFn(item);

    return browser.storage.local.get()
      .then(({ items }) => Object.values(items)
        .filter(filterFn)
        .reduce((itemsAcc, item) => ({ ...itemsAcc, [item.id]: item }), {}))
      .then((filteredItems) => list.render({ items: filteredItems }));
  },
};


browser.storage.local.get().then((data) => {
  list.render(data);

  const filterElements = Array.from(document.querySelectorAll('.js-filter'));

  const filters = filterElements.reduce((filtersAcc, filterElement) => {
    filterElement.addEventListener('click', (event) => {
      event.preventDefault();

      const { target: currentElement } = event;
      const currentType = currentElement.getAttribute('data-type');

      currentElement.classList.toggle('is-info');

      filters[currentType] = !filters[currentType];

      list.filterAndRender(filters);
    });

    return {
      ...filtersAcc,
      [filterElement.getAttribute('data-type')]: true,
    };
  }, {});

  filters.searchFn = () => true;

  const searchTextInputElement = document.getElementById('js-search-text');

  searchTextInputElement.addEventListener('keyup', (event) => {
    const isEscKey = event.keyCode === 27;
    if (isEscKey) {
      searchTextInputElement.value = '';
    }

    const query = searchTextInputElement.value.trim();
    const queryRegex = new RegExp(query, 'i');

    // eslint-disable-next-line object-curly-newline
    filters.searchFn = ({ type, link, text, page }) => {
      const matchesPage = queryRegex.test(page.title) || queryRegex.test(page.metas.description);
      if (matchesPage) {
        return true;
      }

      switch (type) {
        case 'link':
          return queryRegex.test(link.text);

        case 'text':
          return queryRegex.test(text.selection);

        default:
          return false;
      }
    };

    list.filterAndRender(filters);
  });

  browser.runtime.onMessage.addListener((msg) => {
    const { action, item, items } = msg;

    switch (action) {
      case 'add-item':
        list.prependItem(item, filters);
        break;

      case 'clear-all-items':
        list.render();
        break;

      case 'add-all-items':
        list.prependAllItems(items, filters);
        break;

      default:
        console.warn('Unknown action type "%s"!', msg.type);
        break;
    }
  });
});
