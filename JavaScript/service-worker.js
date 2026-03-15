// Import
import { AlarmList } from './Alarms.js';
import { Groups, RestrictionGroup } from './Restriction.js';

//////////////////////
//
// Helper Methods
//
//////////////////////
async function dailyResetFire(alarm) {
    // Get all groups
    let groups = await Groups.getGroups();

    // Loop through each group, reset their opens_left
    for (let group of groups) {
        group.opens_left = group.opens_total;
    }

    // Post them
    await Groups.postGroups(groups);

    // Make next daily reset
    await AlarmList.createDailyAlarm();
}

async function groupAlarmFire(alarm) {
    // Open timer has finished
    // Retreive group, update blocked status.
    let group = await Groups.getGroup(alarm.name);
    group.blocked = true;
    await Groups.postGroup(group);

    // Remove alarm from storage
    await AlarmList.removeAlarm(alarm);

    // Grab all tabs and send message
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        chrome.tabs.sendMessage( tab.id, { action: "BlockPage", group }, () => {
            if (chrome.runtime.lastError) {
                // No content script
            }
        });
    }
}



//////////////////////
//
// Message Handling
//
//////////////////////
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // // Testing
    // chrome.tabs.sendMessage({
    //     action: "BlockPage",
    //     group: group
    // });
    // return;

    ///////////////////////////////////////
    // Request to make new Blocking Page
    ///////////////////////////////////////
    if (msg.action === "newPage") {

        chrome.tabs.create({ url: "blocking.html" }, (tab) => {
            // Store tabs information for display
            chrome.storage.local.set({
                [tab.id + "_BlockInfo"]: {
                    group: msg.group,
                    link: msg.link
                }
            });

            // Close the opening tab
            chrome.tabs.remove(sender.tab.id);
        });

        // Signal an async response
        return true;
    }


    /////////////////////////////////////////////
    // Block page is requesting its information
    /////////////////////////////////////////////
    if (msg.action === "blockPageInfoRequest") {

        // Retrieve tabs respsective information
        chrome.storage.local.get([sender.tab.id + "_BlockInfo"]).then((result) => {
            sendResponse({blockInfo : result[sender.tab.id + "_BlockInfo"]});
        })

        return true;
    }

    ////////////////////////////////
    // Request to check page match
    ////////////////////////////////
    if (msg.action === "pageCheck") {

        // Search for an active group
        Groups.findActive(msg.link).then((group) => {
            // Send over the matched group, or nothing
            sendResponse({group: group});
        });

        // Async Response
        return true;
    }
});



//////////////////////
//
// Alarm Logic
//
//////////////////////
chrome.alarms.onAlarm.addListener(async (alarm) => {

    // Reset groups opens when have a daily reset
    if (alarm.name == "DailyReset") {
        // Fire the daily reset
        await dailyResetFire(alarm);
    }

    // Other alarm, must be group lock
    else {
        // Fire the group alarm
        await groupAlarmFire(alarm);
    }
});



//////////////////////
//
// Startup
//
//////////////////////
chrome.runtime.onStartup.addListener(async () => {
    console.log("Startup");

    // TODO need to go through all alarms in alarm list and check if done or not
    let alarmList = await AlarmList.getAlarms();

    console.log(alarmList);

    // Grab the current time
    let currTime = new Date().getTime();

    // Iterate over all alarms
    for (let alarm of alarmList) {
        // Checks if the alarm should have fired by now
        if (alarm.scheduledTime < currTime) {
            await groupAlarmFire(alarm);
        } 
    }

    // Daily Reset Logic
    const result = await chrome.storage.local.get(AlarmList.DAILY_RESET_KEY);
    const storedTime = result[AlarmList.DAILY_RESET_KEY];


    // If the stored reset time is in the past, the reset was missed
    if (storedTime && storedTime < currTime) {
        console.log("Missed daily reset — firing manually");
        await dailyResetFire({ name: "DailyReset" });
    }

    console.log("Startup Done");
});



//////////////////////
//
// Install
//
//////////////////////
self.addEventListener("install", async (event) => {
    console.log("Install");

    // Create Alarm, then store it in the system
    await AlarmList.createDailyAlarm();

    console.log("Install Done");
})