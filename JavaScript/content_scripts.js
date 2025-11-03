////////////////////////////
//
//  Global Data
//
////////////////////////////
let group_list;
let matched_restriction;
let blockPage;

////////////////////////////
//
//  Listeners
//
////////////////////////////
chrome.runtime.onMessage.addListener(async (response, sender) => {
    let match = await findMatch();
    if (response.action === 'unblockRestriction' && match == response.url) {
        console.log("Unblock");
        blockPage.style.visibility='hidden'
    }

    if (response.action === "blockRestriction") {
        console.log("Block");
        blockPage.style.visibility='visible'
    }
});

////////////////////////////
//
//  Get Url Match List
//
////////////////////////////
async function init() {
    // Get Current Restriction List
    restriction_list = await Groups.getGroups();

    ////////////////////////////
    //
    //  Block Page
    //
    ////////////////////////////

    // Get Match, or null
    group = await Groups.findMatch();

    // Found a match, block
    if (group) {
        //////////////////
        //  Make Block
        //////////////////

        // Create Background
        blockPage = document.createElement('div');
        blockPage.id = "blockPageBackground";
        document.body.prepend(blockPage);

        blockPage_Body = document.createElement('div');
        blockPage_Body.id = "blockPage_Body"
        blockPage.append(blockPage_Body);

        // Create Group Text
        group_name = document.createElement('p');
        group_name.id = "group_name";
        group_name.className = "text";
        group_name.textContent = group.group_name;
        blockPage_Body.append(group_name);

        // Create Open Text
        open_text = document.createElement('p');
        open_text.id = "open_text";
        open_text.className = "text";
        open_text.textContent = "Opens: " + group.opens_left + "/" + group.opens_total;
        blockPage_Body.append(open_text);

        // Create Unblock Button
        const requestUnblock = document.createElement("button");
        requestUnblock.textContent = "Unblock? " + group.pause_time + "s";
        requestUnblock.className = "button";
        requestUnblock.id = "unlock_button";
        requestUnblock.addEventListener('click', function(){
            chrome.runtime.sendMessage({action: "startTimerRequest", group:group})
        });
        blockPage_Body.append(requestUnblock);

        // Check if restriction is open or not, display accordingly
        if (!restriction.unblocked) blockPage.style.visibility='visible'
        else                        blockPage.style.visibility='hidden'
    }

    
}

init();