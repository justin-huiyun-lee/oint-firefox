browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open_link_in_new_tab") {
    browser.tabs.create({ url: message.url });
  }
});
