const onMenuCreated = (id) => () => {
  if (browser.runtime.lastError) {
    console.log(`Error while creating menu item: ${browser.runtime.lastError}`);
  } else {
    console.log('Menu item "%s" created successfully.', id);
  }
};

function createMenu(menu) {
  browser.menus.create(menu, onMenuCreated(menu.id));
}
