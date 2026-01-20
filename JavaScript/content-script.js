////////////////////////////
//
//  Global Data
//
////////////////////////////
const BLOCK_DIV_ID = "blockPageBackground";

console.log("Hello");



////////////////////////////
//
//  Message Handling
//
////////////////////////////

// Message from service worker to block associated tabs
chrome.runtime.onMessage.addListener((msg, sender) => {

    console.log("Hello from ur reblock");

    // Receiving notice of SOME group getting blocked
    if (msg.action == "BlockPage") {

        // Check if current page should be blocked
        let link = window.location.href;
        
        // Request active group
        chrome.runtime.sendMessage({action: "pageCheck", link: link}, (response) => {
            
            let group = response.group;

            // No matching group
            if (!group) return;


            /////////////////////
            //  Open Block Page
            /////////////////////

            // Send a message to the service worker to make a block page
            chrome.runtime.sendMessage({ 
                action: "newPage",
                group: group,
                link: link
            });
        }); 
    }
});



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

    // Request active group
    chrome.runtime.sendMessage({action: "pageCheck", link: link}, (response) => {
        
        let group = response.group;

        // No group found
        if (!group) return;


        /////////////////////
        //  Open Block Page
        /////////////////////

        // Send a message to the service worker to make a block page
        chrome.runtime.sendMessage({ 
            action: "newPage",
            group: group,
            link: link
        });
    }); 
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

console.log("Script Run");
