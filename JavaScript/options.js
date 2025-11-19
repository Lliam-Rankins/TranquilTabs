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

function hideOptions() {
    document.getElementById("group_settings_backdrop").style.display = "none";
}
 
function showEmptyOptions() {
    document.getElementById("group_settings_backdrop").style.display = "flex";
}

function showOptions(group) {

}

async function populateGroups() {
    
    // For every group, add a group to the group list
    for (var i = 0; i < groups.length; i++) {
        addGroup(groups[i]);
    }

}

// Responsible for creating a group div
async function addGroup(group) {
    let groupDiv = document.createElement('div');
    groupDiv.className = "group sageContainer";


    ////////////////////
    //  Streak
    ////////////////////

    // Streaks
    let streak = document.createElement('div');
    streak.className = "streak mintContainer";
    streak.innerHTML = group.streak + "<br>Days";



    //////////////////////
    //  Group Name/Days
    //////////////////////

    // Group Name
    let groupName = document.createElement('p');
    groupName.className = "groupName";
    groupName.textContent = group.group_name;

    // Group Name Bar
    let groupNameBar = document.createElement('div');
    groupNameBar.className = "bar";

    // Days
    let days = document.createElement('div');
    days.className = "days";

    let daysOfTheWeek = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
    console.log(group.weekdays.entries());
    for (const [i, weekday] of group.weekdays.entries()) {
        let day = document.createElement('div');
        day.className = "mintContainer day ";

        // Active Day
        if (weekday == true) {
            day.className += "activeDay";
        }
        // Innactive Day
        else {
            day.className += "innactiveDay";
        }

        day.innerHTML = daysOfTheWeek[i];

        days.append(day);
    }

    let groupNameDays = document.createElement('div');
    groupNameDays.className = "groupNameDays";
    groupNameDays.append(groupName);
    groupNameDays.append(groupNameBar);
    groupNameDays.append(days);



    //////////////////////
    //  Group Tools Top
    //////////////////////
    
    // Time
    let time = document.createElement('div');
    time.className = "time mintContainer";
    time.innerHTML = group.start_time + "<br>" + group.end_time;

    // Up Button
    let upButton = document.createElement('button');
    upButton.className = "priorityButton mintContainer";

    let upArrow = document.createElement('img');
    upArrow.className = "arrowImg";
    upArrow.src = "../Media/triangle.png";
    upButton.append(upArrow);

    let groupToolsTop = document.createElement('div');
    groupToolsTop.className = "groupToolsTop";
    groupToolsTop.append(time);
    groupToolsTop.append(upButton);



    ////////////////////////
    //  Group Tools Bottom
    ////////////////////////

    // Edit Button
    let editButton = document.createElement('button');
    editButton.className = "editButton mintContainer";

    // Edit Icon
    let editIcon = document.createElement('img');
    editIcon.className = "editIcon";
    editIcon.src = "../Media/edit_pencil.png";
    editButton.append(editIcon);

    // Opens Left/Total
    let opens = document.createElement('div');
    opens.className = "opens mintContainer";
    opens.textContent = group.opens_left + "/" + group.opens_total + " Opens";
    
    // Down Button
    let downButton = document.createElement('button');
    downButton.className = "priorityButton mintContainer";

    let downArrow = document.createElement('img');
    downArrow.className = "arrowImg";
    downArrow.src = "../Media/triangle.png";
    downArrow.style.transform = "scaleY(-1)";
    downButton.append(downArrow);

    let groupToolsBottom = document.createElement('div');
    groupToolsBottom.className = "groupToolsBottom";
    groupToolsBottom.append(editButton);
    groupToolsBottom.append(opens);
    groupToolsBottom.append(downButton);



    ////////////////////////
    //  Group Appendation
    ////////////////////////

    // Group Tools
    let groupTools = document.createElement('div');
    groupTools.className = "groupTools";
    groupTools.append(groupToolsTop);
    groupTools.append(groupToolsBottom);

    groupDiv.append(streak);
    groupDiv.append(groupNameDays);
    groupDiv.append(groupTools);

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

    // Add Click to options backdrop
    document.getElementById("group_settings_backdrop").addEventListener("click", function(e) {
        if (e.target == this) hideOptions();
    });

    // Add Click to new group backdrop
    document.getElementById("new_group_button").addEventListener("click", showEmptyOptions);
}


// const restriction_table = document.getElementById("restrictedURL_table");
init();