/////////////////////////
//
//  Helper Functions
//
////////////////////////

const timerTypes = {
    PRIMARY : "Primary",
    SECONDARY : "Secondary"
}

//////////////////////
// Restriction
//////////////////////
async function requestRestriction(url) {
    let result = await chrome.storage.local.get(url);
            
    return result[url];
}

// Stores the restriction
async function postRestriction(restriction) {
    // // If Url isnt in url list, need to update it
    // if (!restriction_list || !restriction_list.includes(restriction.url)) {
    //     updateRestrictionList(restriction.url);
    // }

    // Store Restriction
    await chrome.storage.local.set({ [restriction.url] : restriction});
}

// Listening for messages from other pages, ie: Start Timer
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

    /*
    *   Creates offscreen document if needed, and sends request to start a timer
    *   @type   :   Passing
    *   @sender :   content_scripts
    *   @forward:   timers.html
    */
    if (request.action === 'startTimerRequest') {
        //////////////////////
        //  Make Timer Page
        //////////////////////
        try {
            // No Timer Page
            await chrome.offscreen.createDocument({
                url: 'timers.html',
                reasons: ['CLIPBOARD'],
                justification: 'reason for needing the document',
            });

            console.log("Made Offscreen");
        } catch (error) {
            // Timer Page Already Exists
            if (!error.message.startsWith('Only a single offscreen'))
            throw error;
        }

        //////////////////////
        //  Start Timer
        //////////////////////

        // Make timer on timers page
        chrome.runtime.sendMessage({action: "startTimer", restriction:request.restriction});
    }


    /*
    *   Notifys the completion of a timer
    *   @type   :   Passing
    *   @sender :   timers.html
    *   @forward:   all_tabs
    */
    if (request.action === 'timerFinished') {
        console.log("Timer Finished");
        // Post updated restriction
        postRestriction(request.restriction);
        
        
        const tabs = await chrome.tabs.query({});

        for (const tab of tabs) {
            console.log(tab.id);

            let action;
            if (request.timerType == timerTypes.PRIMARY)    action = "unblockRestriction";
            else                                            action = "blockRestriction";
            chrome.tabs.sendMessage(tab.id, {action:action, url:request.restriction.url});
        }
    }
});