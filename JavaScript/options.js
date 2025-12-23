////////////////////////////
//
//  Global Variables
//
////////////////////////////
// var groups;

////////////////////////////
//
//  Helper Functions
//
////////////////////////////

function hideOptions() {
    document.getElementById("group_settings_backdrop").style.display = "none";
}
 
function showEmptyOptions() {
    // Reset Error Message
    let errorMessage = document.getElementById("group_settings_error_message");
    errorMessage.innerHTML = "";
    errorMessage.style.visibility = "hidden";

    // Add Group ID to save button
    document.getElementById('group_save_button').setAttribute("data-edit-id", '');

    // Group Name
    document.getElementById('settings_group_name').innerHTML = "Click Me";

    // Days of the Week
    document.getElementById('sunday').checked = false;
    document.getElementById('monday').checked = false;
    document.getElementById('tuesday').checked = false;
    document.getElementById('wednesday').checked = false;
    document.getElementById('thursday').checked = false;
    document.getElementById('friday').checked = false;
    document.getElementById('saturday').checked = false;

    document.getElementById('start_time').value = '';
    document.getElementById('end_time').value = '';

    document.getElementById('pause_time').value = '';
    document.getElementById('open_time').value = '';

    document.getElementById('opens').value = '';

    // Clear Websites
    let website_list = document.getElementById('websites');
    website_list.innerHTML = '';

    document.getElementById("group_settings_backdrop").style.display = "flex";
}

function showOptions(group) {
    // Reset Error Message
    let errorMessage = document.getElementById("group_settings_error_message");
    errorMessage.innerHTML = "";
    errorMessage.style.visibility = "hidden";

    // Add Group ID to save button
    document.getElementById('group_save_button').setAttribute("data-edit-id", group.id);

    console.log(group);

    // Group Name
    document.getElementById('settings_group_name').innerHTML = group.group_name;

    // Days of the Week
    document.getElementById('sunday').checked = group.weekdays[0];
    document.getElementById('monday').checked = group.weekdays[1];
    document.getElementById('tuesday').checked = group.weekdays[2];
    document.getElementById('wednesday').checked = group.weekdays[3];
    document.getElementById('thursday').checked = group.weekdays[4];
    document.getElementById('friday').checked = group.weekdays[5];
    document.getElementById('saturday').checked = group.weekdays[6];

    document.getElementById('start_time').value = group.start_time;
    document.getElementById('end_time').value = group.end_time;

    document.getElementById('pause_time').value = group.pause_time;
    document.getElementById('open_time').value = group.open_time;

    document.getElementById('opens').value = group.opens_total;

    populateWebsites(group.urls);

    document.getElementById("group_settings_backdrop").style.display = "flex";
}

function populateWebsites(websites) {
    let website_list = document.getElementById('websites');
    website_list.innerHTML = '';

    for (let website of websites) {
        addWebsite(website_list, website);
    }
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

async function populateGroups() { 
    // For every group, add a group to the group list
    let groups = await Groups.getGroups();

    // Sort Groups
    groups.sort((a, b) => b.priority - a.priority);

    for (var i = 0; i < groups.length; i++) {
        addGroup(groups[i]);
    }
}

async function repopulateGroups() { 
    // Delete group list, repopulate
    document.getElementById('group_list').innerHTML = '';
    await populateGroups();
}

// Responsible for creating a group div
async function addGroup(group) {
    let groupDiv = document.createElement('div');
    groupDiv.className = "group sageContainer";
    groupDiv.setAttribute('data-group-id', group.id);


    ////////////////////
    //  Streak
    ////////////////////

    // Streaks
    let streak = document.createElement('div');
    streak.className = "streak mintContainer";
    streak.innerHTML = RestrictionGroup.getStreak(group.streak_start_date) + "<br>Days";



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

    let daysOfTheWeek = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
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
    time.innerHTML = "Start: " + group.start_time + "<br>" + "End:  " + group.end_time;

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
    opens.textContent = group.opens_left + "/" + group.opens_total;
    
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
    


    ////////////////////////////
    //  Button Functionality
    ////////////////////////////
    
    // Edit Button
    editButton.addEventListener("click", async function(e) {
        let group_elements = document.querySelectorAll("div[data-groupID]");

        // Find relevant group by iterating up
        let target = e.target;
        while(!target.hasAttribute('data-group-id')) {
            target = target.parentElement;
        }

        let group = await Groups.getGroup(target.getAttribute('data-group-id'));

        showOptions(group);
    })

    // Lower Priority 
    downButton.addEventListener("click", async function(e) {
        let group_elements = document.querySelectorAll("div[data-groupID]");

        // Find relevant group by iterating up
        let target = e.target;
        while(!target.hasAttribute('data-group-id')) {
            target = target.parentElement;
        }

        let group = await Groups.getGroup(target.getAttribute('data-group-id'));

        await Groups.swapLower(group);

        await repopulateGroups();
    })   

    // Raise Priority
    upButton.addEventListener("click", async function(e) {
        let group_elements = document.querySelectorAll("div[data-groupID]");

        // Find relevant group by iterating up
        let target = e.target;
        while(!target.hasAttribute('data-group-id')) {
            target = target.parentElement;
        }

        let group = await Groups.getGroup(target.getAttribute('data-group-id'));

        await Groups.swapHigher(group);

        await repopulateGroups();
    })

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
    // Reset Error Message
    let errorMessage = document.getElementById("group_settings_error_message");
    errorMessage.innerHTML = "";
    errorMessage.style.visibility = "hidden";

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

    // If no start time or end time
    if (start_time == '' || end_time == '') {
        errorMessage.innerHTML = "Start or end time missing.";
        errorMessage.style.visibility = "visible";
        return;
    }

    let pause_time = document.getElementById("pause_time").value;
    let open_time = document.getElementById("open_time").value;

    // If no pause time, assume 0s
    if (pause_time == '') pause_time = 0;

    const opens = document.getElementById("opens").value;

    // If pause/open time or opens are < 0, error
    if (pause_time < 0 || open_time < 0 || opens < 0) {
        errorMessage.innerHTML = "Negative values are not valid.";
        errorMessage.style.visibility = "visible";
        return;
    }

    // Grab all websites
    let websites_list = document.getElementsByClassName("website_text");

    let websites = [];
    for (const website of websites_list) {
        websites.push(website.innerHTML);
    }

    if (websites.length < 1) {
        errorMessage.innerHTML = "Must have at least one website.";
        errorMessage.style.visibility = "visible";
        return;
    }

    // Check if there is an ID or not
    let id = document.getElementById("group_save_button").getAttribute("data-edit-id");
    if (id == '') id = await Groups.getNextID();

    // Make new restriction
    let newRestrictionGroup = new RestrictionGroup(group_name, id, websites, null, pause_time, open_time, weekdays, start_time, end_time, opens, null);
    console.log(newRestrictionGroup);

    // Post Restriction Group
    await Groups.postGroup(newRestrictionGroup);

    await repopulateGroups();

    // Hide settings page
    document.getElementById("group_settings_backdrop").style.display = 'none';
});


///////////////////
//  Delete Group
///////////////////
document.getElementById("group_delete_button").addEventListener("click", async () => {
    // Check if there is an ID or not
    let id = document.getElementById("group_save_button").getAttribute("data-edit-id");
    if (id == '') return;

    await Groups.removeGroup(id);

    await repopulateGroups();

    hideOptions();
})


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