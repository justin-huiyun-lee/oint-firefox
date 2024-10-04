// Function to check if the current website is whitelisted
function isWhitelisted(currentHost, callback) {
  browser.storage.local.get("whitelist", function (result) {
    const whitelist = result.whitelist || [];
    const isInWhitelist = whitelist.includes(currentHost);
    callback(isInWhitelist);
  });
}

document.addEventListener("click", function (event) {
  // Check if the clicked element is a link
  let link = event.target.closest("a");
  if (link && link.href) {
    const currentHost = window.location.hostname;

    // Check if the current site is whitelisted
    isWhitelisted(currentHost, function (isInWhitelist) {
      if (!isInWhitelist) {
        // If not whitelisted, open the link in a new tab
        event.preventDefault();
        browser.runtime.sendMessage({
          action: "open_link_in_new_tab",
          url: link.href,
        });
      }
    });
  }
});
