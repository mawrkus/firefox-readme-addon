function onClickDelete(event, createdOn) {
  if (!event.target.classList.contains('js-delete')) {
    return;
  }

  event.preventDefault();

  browser.storage.local.get()
    .then((data) => {
      const updatedData = {
        ...data,
        items: data.items.filter((i) => i.createdOn !== createdOn),
      };

      return browser.storage.local.set(updatedData)
        .then(() => updatedData);
    })
    .then(renderItems);
}

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
  return items.sort((a, b) => b.createdOn - a.createdOn);
}

function renderItems({ items }) {
  const listElement = document.getElementById('reading-list');
  listElement.innerHTML = '';

  sortItems(items).forEach((item) => {
    const itemElement = document.createElement('li');
    itemElement.innerHTML = renderItem(item);
    listElement.appendChild(itemElement);
    itemElement.onclick = (e) => onClickDelete(e, item.createdOn);
  });
}

browser.storage.local.get()
  .then(renderItems);

browser.runtime.onMessage.addListener((item) => {
  browser.storage.local.get()
    .then(renderItems);
});
