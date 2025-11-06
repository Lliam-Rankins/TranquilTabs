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

async function populateGroups() {
    
    
    // 
    for (var i = 0; i < groups.length; i++) {
        addGroup(groups[i]);
    }
}

// Responsible for creating a group div
async function addGroup(group) {

}

function populateUrls(urls) {

}

// Adds a website to the Unorder List of websites
function addWebsite(website_list, website) {
    // TODO: needs to also add the relevant delete buttons

    // Create Element
    const url = document.createElement("li");
    url.textContent = website;
    url.className = "website_text";

    // Add element to list
    website_list.append(url);
}

////////////////////////////
//
//  Listeners
//
////////////////////////////
const group_form = document.getElementById("group_settings");

/////////////////////
//  Add new website
/////////////////////
document.getElementById("new_url_button").addEventListener("click", function() {
    const new_url_request = document.getElementById("new_url").value;

    // Check value
    if (new_url_request.length <= 0) return;

    const websites_list = document.getElementById("websites");

    addWebsite(websites_list, new_url_request);
});


/////////////////////
//  Save Group
/////////////////////
document.getElementById("group_save_button").addEventListener("click", async function() {
    // Prevent normal submission process
    event.preventDefault();
    
    // Grab Data
    const group_name = document.getElementById("settings_group_name").innerHTML;

    // Calculate what weekdays
    const weekday_boxes = document.getElementsByClassName("weekday");

    let weekdays = [];
    for (let i = 0; i < weekday_boxes.length; i++) {
        weekdays[i] = weekday_boxes[i].checked;
    }

    const start_time = document.getElementById("start_time").value;
    const end_time = document.getElementById("end_time").value;

    const pause_time = document.getElementById("pause_time").value;
    const open_time = document.getElementById("open_time").value;

    const opens = document.getElementById("opens").value;

    // Grab all websites
    let websites_list = document.getElementsByClassName("website_text");

    let websites = [];
    for (const website of websites_list) {
        websites.push(website.innerHTML);
    }

    // Make new restriction
    let id = await Groups.getNextID();
    let newRestrictionGroup = new RestrictionGroup(group_name, id, websites, null, pause_time, open_time, weekdays, start_time, end_time, opens, null);

    // Post Restriction Group
    await Groups.postGroup(newRestrictionGroup);

    console.log(newRestrictionGroup);

    // TODO: Add group to main list of groups
});


////////////////////////////
//
//  Setup
//
////////////////////////////
async function init() {
    // Get the grid and groups
    var group_grid = document.getElementById("group_grid");
    groups = await Groups.getGroups();

    // Groups, display them
    if (groups && groups.length > 0) {
        console.log(groups);
        populateGroups(group_grid);
    }
    // No Groups, tell user to add some
    else {
        console.log("No Groups");
    }
}


// const restriction_table = document.getElementById("restrictedURL_table");
init();