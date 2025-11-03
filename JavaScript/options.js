////////////////////////////
//
//  Global Variables
//
////////////////////////////
var groups;

////////////////////////////
//
//  Helper Functions
//
////////////////////////////

async function populateGroups(group_grid) {
    // 
    for (var i = 0; i < groups.length; i++) {
        addGroup(groups[i]);
    }
}

async function addGroup(group) {

}

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

////////////////////////////
//
//  Listeners
//
////////////////////////////
// const url_form = document.getElementById("URL");
// const max_opens_form = document.getElementById("max_opens");
// const wait_time_form = document.getElementById("wait_time");
// const open_time_form = document.getElementById("open_time");

// document.getElementById("submit").addEventListener("click", function() {
//     let url;
//     let max_opens;
//     let wait_time
//     let open_time;

//     // Grab Url_form Value,  stored Raw, wiill interpret at RegEx later.
//     url = url_form.value;

//     // Empty Max Opens, set -1
//     if (!max_opens_form.value) max_opens = -1;
//     else max_opens = max_opens_form.value;

//     // Empty Wait_time, set -1
//     if (!wait_time_form.value) wait_time = -1;
//     else wait_time = wait_time_form.value;

//     // If constant blocking (wait_time = -1), open_time = -1
//     if (!wait_time_form.value) open_time = -1;
//     else open_time = open_time_form.value;

//     // Make Restriction, store it
//     let newRestriction = new Restriction(url, max_opens, max_opens, wait_time, open_time);

//     // Post Restriction
//     postRestriction(newRestriction);
//     restriction_list.push(url);

//     addRow(restriction_table, newRestriction);
// });


////////////////////////////
//
//  Setup
//
////////////////////////////
async function init() {
    // Get the grid and groups
    var group_grid = document.getElementById("group_grid");
    groups = await Groups.getGroups();

    console.log(groups);

    // Groups, display them
    if (groups && groups.length > 0) {
        populateGroups(group_grid);
    }
    // No Groups, tell user to add some
    else {

    }
}


// const restriction_table = document.getElementById("restrictedURL_table");
init();