// Function to get the current active tab
function getCurrentTab() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve(tabs[0]);
    });
  });
}

// Function to check if the current site is whitelisted
function isWhitelisted(currentHost, callback) {
  browser.storage.local.get("whitelist", function (result) {
    const whitelist = result.whitelist || [];
    callback(whitelist.includes(currentHost));
  });
}

// Function to toggle whitelist status
function toggleWhitelist(currentHost) {
  browser.storage.local.get("whitelist", function (result) {
    let whitelist = result.whitelist || [];

    if (whitelist.includes(currentHost)) {
      // Remove the site if it's in the whitelist
      whitelist = whitelist.filter((site) => site !== currentHost);
    } else {
      // Add the site if it's not in the whitelist
      whitelist.push(currentHost);
    }

    // Save the updated whitelist
    browser.storage.local.set({ whitelist: whitelist }, function () {
      updateButton(currentHost);
    });
  });
}

// Function to update the button text based on whether the site is whitelisted
function updateButton(currentHost) {
  isWhitelisted(currentHost, function (isInWhitelist) {
    const button = document.getElementById("toggleWhitelistButton");
    if (isInWhitelist) {
      button.textContent = "Remove from Whitelist";
    } else {
      button.textContent = "Add to Whitelist";
    }
  });
}

// Function to initialize the checkbox state
function initCheckbox() {
  const checkbox = document.getElementById("enableNewTabsCheckbox");

  // Get the stored checkbox value from storage
  browser.storage.local.get("enableNewTabs", function (result) {
    checkbox.checked = result.enableNewTabs !== false; // Default to true if not set

    // Listen for checkbox changes and save to storage
    checkbox.addEventListener("change", function () {
      browser.storage.local.set({ enableNewTabs: checkbox.checked });
    });
  });
}

// Initialize the popup with the current website and checkbox
getCurrentTab().then((tab) => {
  const currentHost = new URL(tab.url).hostname;
  document.getElementById("currentWebsite").textContent =
    `Current Site: ${currentHost}`;
  updateButton(currentHost);

  // Initialize the checkbox state
  initCheckbox();

  // Add event listener to toggle whitelist on button click
  document
    .getElementById("toggleWhitelistButton")
    .addEventListener("click", () => {
      toggleWhitelist(currentHost);
    });
});
