//////////////////////
// Message Handling
//////////////////////
chrome.runtime.onMessage.addListener(
    // TODO: Only allow update on first message
    function processBlockInfo(msg, sender, sendResponse) {
        // Receiving Info about the page we're blocking
        if (msg.action == "BlockInfo") {

            localStorage.setItem("group", JSON.stringify(msg.group));
            localStorage.setItem("link", msg.link);

            document.getElementById("group_name").innerHTML = msg.group.group_name;
            document.getElementById("open_text").innerHTML = msg.group.opens_left + "/" + msg.group.opens_total;
            document.getElementById("unlock_button").innerHTML = "Unblock? " + msg.group.pause_time + "s";

            chrome.runtime.onMessage.removeListener(processBlockInfo);
        }
    }
);



//////////////////////
//  Reload Protection
//////////////////////

// Get Group and Link
let group = localStorage.getItem("group")
let link = localStorage.getItem("link")
let parsedGroup = null;

// If we have a stored group and link
if (group && link) {
    parsedGroup = JSON.parse(localStorage.getItem("group"));
    document.getElementById("group_name").innerHTML = parsedGroup.group_name;
    document.getElementById("open_text").innerHTML = parsedGroup.opens_left + "/" + parsedGroup.opens_total;
    document.getElementById("unlock_button").innerHTML = "Unblock? " + parsedGroup.pause_time + "s";
}



///////////////////
// Button Control
///////////////////
document.getElementById("unlock_button").addEventListener("click", async () => {
    // Using last open
    if (parsedGroup.opens_left == 1) {
        document.getElementById("unlock_button").textContent = "Blocked";
    }

    // Valid Unblock
    if (parsedGroup.opens_left > 0) {
        document.getElementById("open_text").textContent = "Opens: " + (parsedGroup.opens_left - 1) + "/" + parsedGroup.opens_total;
        
        // Alert service worker to start an alarm
        // chrome.runtime.sendMessage({
        //     action: "startAlarm",
        //     group: 
        // })

        console.log(parsedGroup);

        // Wait for pause time
        setTimeout(async () => {
            // Unlock group
            let dataGroup = await Groups.getGroup(parsedGroup.id);
            dataGroup.blocked = false;
            dataGroup.opens_left -= 1;
            await Groups.postGroup(dataGroup);

            // Start alarm
            await chrome.alarms.create(
                // Name of alarm is the group ID
                String(parsedGroup.id),
                {
                    delayInMinutes: parsedGroup.open_time
                }
            )

            // Send user to original webpage
            window.open(link);

            // Close current tab
            window.close();

        }, parsedGroup.pause_time * 1000);

        

        console.log(link);
        // chrome.tabs.create({ url: "www.youtube.com" });
    }
    else {
        // Do nothing
    }
});



