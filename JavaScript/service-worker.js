// Import
import { Groups, RestrictionGroup } from './Restriction.js';

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
        console.log("Daily reset happening");
        // Get all groups
        let groups = await Groups.getGroups();

        // Loop through each group, reset their opens_left
        for (group in groups) {
            group.opens_left = group.opens_total;
        }

        // Post them
        console.log(groups);
        await Groups.postGroups(groups);
    }

    // Other alarm, must be group lock
    else {
        // Open timer has finished
        // Retreive group, update blocked status.
        let group = await Groups.getGroup(alarm.name);
        group.blocked = true;
        await Groups.postGroup(group);

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
    
});



//////////////////////
//
// Startup
//
//////////////////////
chrome.runtime.onStartup.addListener(async () => {
    console.log("Setting the daily reset");

    const dailyAlarm = await chrome.alarms.get("Daily-Reset");
    console.log(dailyAlarm);

    // If no alarm exists
    if (!dailyAlarm) {
        console.log("No daily reset alarm");
        // Calcuate time until next 2AM
        let currTime = new Date();
        let alarmTime = new Date().setHours(2, 0, 0, 0);

        // Already passed 2 AM
        if (currTime > alarmTime) {
            alarmTime += 24 * 60 * 60 * 1000;
        }

        // Make the alarm
        chrome.alarms.create("DailyReset",
            // (alarmTime.getTime() - currTime.getTime()) / 1000 / 60
            {
                // Delay is minutes until next 2 am
                delayInMinutes: 1,
                // 24 Hour delay
                periodInMinutes: 24 * 60
            }
        );
    }
});
