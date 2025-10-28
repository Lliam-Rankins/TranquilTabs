////////////////////////////
//
//  Global Data
//
////////////////////////////
let restriction_list;
let matchedURL;
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
        blockPage.style.display = "none";
    }

    if (response.action === "blockRestriction") {
        console.log("Block");
        blockPage.style.display = "flex";
    }
});

////////////////////////////
//
//  Helper Functions
//
////////////////////////////

//////////////////////
// Start Timer
//////////////////////

//////////////////////
// Restriction List
//////////////////////
async function requestRestrictionList() {
    let result = await chrome.storage.local.get("URLS");

    return result.URLS || [];
}

//////////////////////
// Restriction
//////////////////////
async function requestRestriction(url) {
    let result = await chrome.storage.local.get(url);
            
    return result[url];
}

// Finds the matched URL in given list of URLS
async function findMatch() {
    if (!restriction_list) return null;

    // Look through list and find match or not
    for (let i = 0; i < restriction_list.length; i++) {
        // Convert to Regex Format
        let url = restriction_list[i].replaceAll("/", "\\/");
        url = url.replaceAll(".", "\.");
        urlRegex = url.replaceAll("*", ".\*");
        
        let regEx = new RegExp(urlRegex);

        // Found Match, stop searching
        if (window.location.href.match(regEx)) {
            return restriction_list[i];
        }
    }

    return null;
}

////////////////////////////
//
//  Make Data Struct
//
////////////////////////////
class Restriction {
  constructor(url_regex, opens_total, opens_left, wait_time) {
    this.url_regex = url_regex;
    this.opens_total = opens_total;
    this.opens_left = opens_left;
    this.wait_time = wait_time;
    this.unblocked = false;
  }
}





////////////////////////////
//
//  Get Url Match List
//
////////////////////////////
async function init() {
    // Get Current Restriction List
    restriction_list = await requestRestrictionList();

    ////////////////////////////
    //
    //  Block Page
    //
    ////////////////////////////

    // Get Match, or null
    matchedURL = await findMatch();

    // Found a match, block
    if (matchedURL) {
        // Get Restriction
        let restriction = await requestRestriction(matchedURL);

        
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
        group_name.textContent = restriction.url;
        blockPage_Body.append(group_name);

        // Create Open Text
        open_text = document.createElement('p');
        open_text.id = "open_text";
        open_text.className = "text";
        open_text.textContent = "Opens: " + restriction.opens_left + "/" + restriction.opens_total;
        blockPage_Body.append(open_text);

        // Create Unblock Button
        const requestUnblock = document.createElement("button");
        requestUnblock.textContent = "Unblock? " + restriction.wait_time + "s";
        requestUnblock.className = "button";
        requestUnblock.id = "unlock_button";
        requestUnblock.addEventListener('click', function(){
            chrome.runtime.sendMessage({action: "startTimerRequest", restriction:restriction})
        });
        blockPage_Body.append(requestUnblock);

        // Check if restriction is open or not, display accordingly
        if (!restriction.unblocked) blockPage.style.display = "flex";
        else                        blockPage.style.display = "none";
    }

    
}

init();