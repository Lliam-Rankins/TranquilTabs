// Import
import { Groups, RestrictionGroup } from './Restriction.js';

//////////////////
//  Data
//////////////////
let group = null;
let link = null;



//////////////////////
// Message Handling
//////////////////////

// Page Requests its blocking information from service worker on load
chrome.runtime.sendMessage({action: "blockPageInfoRequest"}, (response) => {
    console.log(response);
    group = response.blockInfo.group;
    link = response.blockInfo.link;

    document.getElementById("group_name").innerHTML = group.group_name;
    document.getElementById("open_text").innerHTML = "Opens: " + group.opens_left + "/" + group.opens_total;

    if (group.opens_left == 0) {
        document.getElementById("unlock_button").textContent = "Blocked";
    }
    else {
        document.getElementById("unlock_button").innerHTML = "Unblock? " + group.pause_time + "s";
    }
});



///////////////////
// Button Control
///////////////////
document.getElementById("unlock_button").addEventListener("click", async () => {
    // Using last open
    if (group.opens_left == 1) {
        document.getElementById("unlock_button").textContent = "Blocked";
    }

    // Valid Unblock
    if (group.opens_left > 0) {
        document.getElementById("open_text").textContent = "Opens: " + (group.opens_left - 1) + "/" + group.opens_total;

        // Wait for pause time
        setTimeout(async () => {
            // Unlock group
            let dataGroup = await Groups.getGroup(group.id);
            dataGroup.blocked = false;
            dataGroup.opens_left -= 1;
            await Groups.postGroup(dataGroup);

            // Start alarm
            await chrome.alarms.create(
                // Name of alarm is the group ID
                String(group.id),
                {
                    delayInMinutes: group.open_time
                }
            )

            // Send user to original webpage
            window.open(link);

            // Close current tab
            window.close();

        }, group.pause_time * 1000);

        

        console.log(link);
        // chrome.tabs.create({ url: "www.youtube.com" });
    }
    else {
        // Do nothing
    }
});



