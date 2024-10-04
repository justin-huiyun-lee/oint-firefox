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

    // Save the updated whitelist and update the displayed list
    browser.storage.local.set({ whitelist: whitelist }, function () {
      updateButton(currentHost);
      displayWhitelistedWebsites(); // Update the displayed whitelist after changing it
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

// Function to display the list of whitelisted websites
function displayWhitelistedWebsites() {
  const whitelistElement = document.getElementById("whitelistedWebsitesList");

  // Retrieve the whitelist from storage
  browser.storage.local.get("whitelist", function (result) {
    const whitelist = result.whitelist || [];

    // Clear the existing list in the DOM
    whitelistElement.innerHTML = "";
    whitelistElement.classList.add("whitelisted-sites-list");

    // Populate the <ul> with the whitelisted sites
    whitelist.forEach((site) => {
      const listItem = document.createElement("li");
      listItem.classList.add("whitelisted-site");

      const listItemContainer = document.createElement("div");
      listItemContainer.classList.add("list-item-container");

      const text = document.createElement("p");
      text.textContent = site;
      text.classList.add("whitelisted-site-text");

      const textContainer = document.createElement("div");
      textContainer.classList.add("text-container");
      textContainer.appendChild(text);

      const container = document.createElement("div");
      container.classList.add("button-container");

      // Remove button
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.classList.add("button-2");
      removeButton.addEventListener("click", () => {
        // Remove the site from the whitelist
        const updatedWhitelist = whitelist.filter(
          (whitelistedSite) => whitelistedSite !== site,
        );
        browser.storage.local.set({ whitelist: updatedWhitelist }, function () {
          // Refresh the list after removing the site
          displayWhitelistedWebsites();
        });
        updateButton(site);
      });

      // Visit button
      const visitButton = document.createElement("button");
      visitButton.textContent = "Visit Site";
      visitButton.classList.add("button-2");
      visitButton.addEventListener("click", () => {
        // Open the whitelisted site in a new tab
        browser.tabs.create({ url: `https://${site}` });
      });

      container.appendChild(removeButton);
      container.appendChild(visitButton);
      listItemContainer.appendChild(textContainer);
      listItemContainer.appendChild(container);
      listItem.appendChild(listItemContainer);

      whitelistElement.appendChild(listItem);
    });
  });
}

// Initialize the popup with the current website, checkbox, and whitelist
getCurrentTab().then((tab) => {
  const currentHost = new URL(tab.url).hostname;
  document.getElementById("currentWebsite").textContent =
    `Current Site: ${currentHost}`;
  updateButton(currentHost);

  // Initialize the checkbox state
  initCheckbox();

  // Display the whitelisted websites
  displayWhitelistedWebsites();

  // Add event listener to toggle whitelist on button click
  document
    .getElementById("toggleWhitelistButton")
    .addEventListener("click", () => {
      toggleWhitelist(currentHost);
    });
});
