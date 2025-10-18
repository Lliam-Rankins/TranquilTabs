//////////////////////
// Global Vars
//////////////////////
const timerTypes = {
    PRIMARY : "Primary",
    SECONDARY : "Secondary"
}

////////////////////////////
//
//  Helper Functions
//
////////////////////////////

/////////////////////
//  Timers
/////////////////////
async function runTimer(restriction, timerType) {
    console.log(timerType);
    // Update Timer, depending on primary(Unblock) or secondary(Block)
    if (timerType == timerTypes.PRIMARY) {
        restriction.unblocked = true;
        restriction.opens_left -= 1;
    }
    else {
        restriction.unblocked = false;
    }

    console.log("Running Timer");

    // Notify which timer was completed, the updated Restriction state
    chrome.runtime.sendMessage({action: "timerFinished", restriction:restriction, timerType:timerType});

    // Restriction has a limited open time(secodary), set secondary timer
    if (timerType != timerTypes.SECONDARY && restriction.open_time > 0) {
        setTimeout(runTimer, restriction.open_time * 60000, restriction, timerTypes.SECONDARY);
    }
}

/////////////////////
//  Listeners
/////////////////////
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    /*
    *   Request to start a timer from service_worker
    *   @type   :   EndPoint
    *   @sender :   service_worker.js
    */
    if (request.action === 'startTimer') {
        console.log("Starting Timer");
        // Non Zero wait time, set primary timer
        console.log(request.restriction.wait_time);
        if ( request.restriction.wait_time > 0) {
            setTimeout(runTimer, request.restriction.wait_time * 1000, request.restriction, timerTypes.PRIMARY);
        }
        // No primary timer, skip to secondary
        else {
            runTimer(request.restriction, timerTypes.SECONDARY);
        }
    }
});


// Set no open time restrictions to blocked on browser close
// window.onbeforeunload = async function() {
//     let restriction = await requestRestriction();

//     return null
// }