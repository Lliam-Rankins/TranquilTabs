////////////////////////////
//
//  Helper Functions
//
////////////////////////////
async function addRow(table, RestrictionList) {
  // Create Table Row
  let newTableRow = document.createElement('tr');
  table.append(newTableRow);

  let newURL = document.createElement('tb');
  newURL.textContent = RestrictionList.url_regex;

  let newOpenTot = document.createElement('tb');
  newOpenTot.textContent = RestrictionList.opens_total;

  let newWait = document.createElement('tb');
  newWait.textContent = RestrictionList.wait_time;

  newTableRow.append(newURL);
  newTableRow.append(newOpenTot);
  newTableRow.append(newWait);
}

////////////////////////////
//
//  Make Data Struct
//
////////////////////////////
class RestrictionList {
  constructor(url_regex, opens_total, opens_left, wait_time) {
    this.url_regex = url_regex;
    this.opens_total = opens_total;
    this.opens_left = opens_left;
    this.wait_time = wait_time;
  }
}

// Grab Table
document.getElementById("restrictedURL_table");

// Get Stored URL Data


// const hidePage = `body > * { display: none; }`;

// function listenForClicks() {
//   document.addEventListener("click", (e) => {
//     if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
//       return; // Ignore when click is not on a button within <div id="popup-content">.
//     }

//     if (e.target.id === "reset") {
//       browser.tabs.query({ active: true, currentWindow: true })
//         .then(reset)
//         .catch(reportError);
//     } else {
//       browser.tabs.query({ active: true, currentWindow: true })
//         .then(hide)
//         .catch(reportError);
//     }
//   });
// }

// function hide(tabs) {
//   browser.tabs.insertCSS({ code: hidePage });
// }

// function reset(tabs) {
//   browser.tabs.removeCSS({ code: hidePage });
// }

// function reportError(error) {
//   console.error(`Could not hide content: ${error}`);
// }

// browser.tabs
//   .executeScript({ file: "/content_scripts/beastify.js" }) // Assuming beastify.js exists
//   .then(listenForClicks)
//   .catch(reportExecuteScriptError);