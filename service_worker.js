// Listening for messages from other pages, ie: Start Timer
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'startTimer') {
        //////////////////////
        //  Make Timer Page
        //////////////////////
        try {
            await chrome.offscreen.createDocument({
                url: 'timers.html',
                reasons: ['CLIPBOARD'],
                justification: 'reason for needing the document',
            });
        } catch (error) {
            if (!error.message.startsWith('Only a single offscreen'))
            throw error;
        }

        console.log("Hey");

        //////////////////////
        //  Start Timer
        //////////////////////
        sendResponse({msg : "Hiya"});
    }

  return true; // Indicates we will respond asynchronously
});