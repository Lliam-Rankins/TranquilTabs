// Import
import './Restriction.js';

// Message
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // Request to make new Blocking Page
    if (msg.action === "newPage") {

        chrome.tabs.create({ url: "blocking.html" }, (tab) => {

            // Wait for the tab to finish loading
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    chrome.tabs.onUpdated.removeListener(listener);

                    chrome.runtime.sendMessage({
                        action: "BlockInfo",
                        group: msg.group,
                        link: msg.link
                    });

                    // Close the opening tab
                    chrome.tabs.remove(sender.tab.id);
                }
            });
        });

        // Signal an async response
        return true;
    }
});



// Alarm Logic
chrome.alarms.onAlarm.addListener(async (alarm) => {
    // Open timer has finished
    // Retreive group, update blocked status.
    let group = await Groups.getGroup(alarm.name);
    group.blocked = true;
    await Groups.postGroup(group.id);

    // TODO: Send out message to all tabs to block relevant group
    chrome.runtime.sendMessage({
        action: "BlockPage",
        group: group
    })
});
