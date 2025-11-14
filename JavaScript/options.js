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
    
    // For every group, add a group to the group list
    for (var i = 0; i < groups.length; i++) {
        addGroup(groups[i]);
    }

}

// Responsible for creating a group div
async function addGroup(group) {
    // TODO add alternative Text

    ////////////////////
    //  Group Creation
    ////////////////////
    let groupDiv = document.createElement('div');
    groupDiv.className = "group sageContainer";

    // Streaks
    let streak = document.createElement('div');
    streak.className = "streak mintContainer";
    streak.innerHTML = group.streak + "<br>Days";


    // Group Name
    let groupName = document.createElement('p');
    groupName.className = "groupName";
    groupName.textContent = group.group_name;

    // Group Name Bar
    let groupNameBar = document.createElement('div');
    groupNameBar.className = "bar";
    
    // Days
    let dayDiv = document.createElement('div');
    dayDiv.className = "dayDiv";

    // TODO: add days

    let groupDaysDiv = document.createElement('div');
    groupDaysDiv.className = "groupDaysDiv";
    groupDaysDiv.style.flexGrow = "2";
    groupDaysDiv.append(groupName);
    groupDaysDiv.append(groupNameBar);
    groupDaysDiv.append(dayDiv);



    // Time
    let time = document.createElement('div');
    time.className = "time mintContainer";
    time.textContent = group.start_time + " : " + group.end_time;

    // Edit Button
    let editButton = document.createElement('button');
    editButton.className = "divButton mintContainer";

    let editIcon = document.createElement('img');
    editIcon.className = "editIcon";
    editIcon.src = "../Media/edit_pencil.png";
    editButton.append(editIcon);

    // Opens Left/Total
    let opens = document.createElement('div');
    opens.className = "opens mintContainer";
    opens.textContent = group.opens_left + "/" + group.opens_total + " Opens";


    let editOpensDiv = document.createElement('div');
    editOpensDiv.style.display = "flex";
    editOpensDiv.style.flexDirection = "row";
    editOpensDiv.append(editButton);
    editOpensDiv.append(opens);


    let timeEditOpensDiv = document.createElement('div');
    timeEditOpensDiv.className = "timeEditOpensDiv";
    timeEditOpensDiv.append(time);
    timeEditOpensDiv.append(editOpensDiv);


    // Up and Down
    let upButton = document.createElement('button');
    upButton.className = "priorityButton mintContainer";

    let upArrow = document.createElement('img');
    upArrow.className = "arrowImg";
    upArrow.src = "../Media/triangle.png";
    upButton.append(upArrow);
    
    let downButton = document.createElement('button');
    downButton.className = "priorityButton mintContainer";

    let downArrow = document.createElement('img');
    downArrow.className = "arrowImg";
    downArrow.src = "../Media/triangle.png";
    downArrow.style.transform = "scaleY(-1)";
    downButton.append(downArrow);

    let upDown = document.createElement('div');
    upDown.className = "upDown";
    upDown.append(upButton);
    upDown.append(downButton);

    groupDiv.append(streak);
    groupDiv.append(groupDaysDiv);
    groupDiv.append(timeEditOpensDiv);
    groupDiv.append(upDown);

    document.getElementById("group_list").append(groupDiv);

    // Append Group Div

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