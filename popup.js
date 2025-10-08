const hidePage = `body > * { display: none; }`;

function listenForClicks() {
  document.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
      return; // Ignore when click is not on a button within <div id="popup-content">.
    }

    if (e.target.id === "reset") {
      browser.tabs.query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    } else {
      browser.tabs.query({ active: true, currentWindow: true })
        .then(hide)
        .catch(reportError);
    }
  });
}

function hide(tabs) {
  browser.tabs.insertCSS({ code: hidePage });
}

function reset(tabs) {
  browser.tabs.removeCSS({ code: hidePage });
}

function reportError(error) {
  console.error(`Could not hide content: ${error}`);
}

browser.tabs
  .executeScript({ file: "/content_scripts/beastify.js" }) // Assuming beastify.js exists
  .then(listenForClicks)
  .catch(reportExecuteScriptError);