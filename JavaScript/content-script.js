////////////////////////////
//
//  Global Data
//
////////////////////////////
const BLOCK_DIV_ID = "blockPageBackground";



////////////////////////////
//
//  Message Handling
//
////////////////////////////

// Message from service worker to block associated
chrome.runtime.onMessage.addListener(async (msg, sender) => {

    console.log("Hello from ur reblock");

    // Receiving notice of SOME group getting blocked
    if (msg.action == "BlockPage") {
        // Check if current page should be blocked
        let link = window.location.href;
        
        let group = await Groups.findActive(link);

        // No group was active
        if (group == null) return;

        /////////////////////
        //  Open Block Page
        /////////////////////

        // Send a message to the service worker to make a block page
        chrome.runtime.sendMessage({ 
            action: "newPage",
            group: matchedGroup,
            link: link
        });
    }
})



////////////////////////////
//
//  Initial Page Setup
//
////////////////////////////
async function init() {
    ////////////////////////////
    //
    //  Block Page
    //
    ////////////////////////////

    let link = window.location.href;

    // Get active group, or null
    let matchedGroup = await Groups.findActive(link);

    // Found an active group
    if (matchedGroup) {
        /////////////////////
        //  Open Block Page
        /////////////////////

        // Send a message to the service worker to make a block page
        chrome.runtime.sendMessage({ 
            action: "newPage",
            group: matchedGroup,
            link: link
        });
    }
}


////////////////////////////
//
//  On <body> load
//
////////////////////////////
(function waitForBody() {
    if (document.body) {
        init();
    } else {
        // Check again very soon
        requestAnimationFrame(waitForBody);
    }
})();
