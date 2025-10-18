////////////////////////////
//
//  Helper Functions
//
////////////////////////////
var restriction_list;

////////////////////////////
//
//  Helper Functions
//
////////////////////////////
async function addRow(table, Restriction) {
  // Create Table Row
  let newTableRow = document.createElement('tr');
  table.append(newTableRow);

  let newURL = document.createElement('td');
  newURL.textContent = Restriction.url;

  let newOpenTot = document.createElement('td');
  newOpenTot.textContent = Restriction.opens_total;

  let newWait = document.createElement('td');
  newWait.textContent = Restriction.wait_time;

  let newOpenTime = document.createElement('td');
  newOpenTime.textContent = Restriction.open_time;

  newTableRow.append(newURL);
  newTableRow.append(newOpenTot);
  newTableRow.append(newWait);
  newTableRow.append(newOpenTime);
}

//////////////////////
// Restriction List
//////////////////////

// Returns Restriction List
async function requestRestrictionList() {
    let result = await chrome.storage.local.get("URLS");

    return result.URLS || [];
}

// Updates URLS list
async function updateRestrictionList(url) {
    // Add newest URL
    restriction_list.push(url);

    // Store URLS
    await chrome.storage.local.set({"URLS" : restriction_list})
}


//////////////////////
// Restriction
//////////////////////
async function requestRestriction(url) {
    let result = await chrome.storage.local.get(url);
            
    return result[url];
}

// Stores the restriction
async function postRestriction(restriction) {
    // If Url isnt in url list, need to update it
    if (!restriction_list || !restriction_list.includes(restriction.url)) {
        updateRestrictionList(restriction.url);
    }

    // Store Restriction
    await chrome.storage.local.set({ [restriction.url] : restriction});
}

////////////////////////////
//
//  Make Data Struct
//
////////////////////////////
class Restriction {
  constructor(url, opens_total, opens_left, wait_time, open_time) {
    this.url = url;
    this.opens_total = opens_total;
    this.opens_left = opens_left;
    this.wait_time = wait_time;
    this.open_time = open_time;
    this.unblocked = false;
  }
}




////////////////////////////
//
//  Listeners
//
////////////////////////////
const url_form = document.getElementById("URL");
const max_opens_form = document.getElementById("max_opens");
const wait_time_form = document.getElementById("wait_time");
const open_time_form = document.getElementById("open_time");

document.getElementById("submit").addEventListener("click", function() {
    let url;
    let max_opens;
    let wait_time
    let open_time;

    // Grab Url_form Value,  stored Raw, wiill interpret at RegEx later.
    url = url_form.value;

    // Empty Max Opens, set -1
    if (!max_opens_form.value) max_opens = -1;
    else max_opens = max_opens_form.value;

    // Empty Wait_time, set -1
    if (!wait_time_form.value) wait_time = -1;
    else wait_time = wait_time_form.value;

    // If constant blocking (wait_time = -1), open_time = -1
    if (!wait_time_form.value) open_time = -1;
    else open_time = open_time_form.value;

    // Make Restriction, store it
    let newRestriction = new Restriction(url, max_opens, max_opens, wait_time, open_time);

    // Post Restriction
    postRestriction(newRestriction);
    restriction_list.push(url);

    addRow(restriction_table, newRestriction);
});


////////////////////////////
//
//  Setup
//
////////////////////////////
async function init() {
    restriction_list = await requestRestrictionList();
    console.log(restriction_list);

    // Grab Table and display all elements
    if (restriction_list && restriction_list.length > 0) {
        for (const url of restriction_list) {
            let rowRestriction = await requestRestriction(url);
            addRow(restriction_table, rowRestriction);
        }
    }
}


const restriction_table = document.getElementById("restrictedURL_table");
init();