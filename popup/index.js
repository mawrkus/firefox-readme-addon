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

function getItemUrl({ link, media }) {
  return link.url || media.src;
}

function renderItem(item) {
  const { page, link, selection, media, createdOn } = item;
  const itemUrl = getItemUrl(item);

  return `
    <article class="media mb-s">
      <figure class="media-left">
        <p class="image is-64x64">
          ${
            media.src
              ? `<a href="${itemUrl}" target="_blank" title="View image"><img src="${media.src}"></a>`
              : '<img src="https://bulma.io/images/placeholders/128x128.png">'
          }
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <p>
            <a href="${page.url}" target="_blank" class="has-text-dark" title="Visit page">
              <strong>${page.title}</strong>
            </a>
            <br>
            <small>${new Date(createdOn).toUTCString()}</small>
            <br>
            ${
              itemUrl
                ? `<a href="${itemUrl}" target="_blank" title="Visit link">${link.text || selection.text || itemUrl}</a>`
                : `<blockquote>${link.text || selection.text}</blockquote>`
            }
          </p>
        </div>
      </div>
      <div class="media-right">
        <button class="delete js-delete"></button>
      </div>
    </article>
  `;
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
