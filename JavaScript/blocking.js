// Import
import { AlarmList } from './Alarms.js';
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


    // Display forest
    
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
            // Try to get an alarm with the matching id
            let activeAlarm = await chrome.alarms.get("" + group.id);

            // Found an alarm for this group
            if (activeAlarm) {
                return;
            }


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

            // Grab the alarm information
            const newAlarm = await chrome.alarms.get("" + group.id);

            // console.log(newAlarm);

            // Store alarm
            await AlarmList.postAlarm(newAlarm);

            // console.log(await AlarmList.getAlarms());

            // Send user to original webpage
            window.open(link);

            // Close current tab
            window.close();

        }, group.pause_time * 1000);
    }
    else {
        // Do nothing
    }
});



