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
        blockPage.style = "display: none;";
    }

    if (response.action === "blockRestriction") {
        console.log("Block");
        blockPage.style = "display: block;";
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
        document.body.append(blockPage);

        // Create Unblock Button
        const requestUnblock = document.createElement("button");
        requestUnblock.textContent = "Unblock? " + restriction.wait_time + "s";
        requestUnblock.className = "button";
        requestUnblock.id = "requestUnblock";
        requestUnblock.addEventListener('click', function(){
            chrome.runtime.sendMessage({action: "startTimerRequest", restriction:restriction})
        });
        blockPage.append(requestUnblock);

        // Check if restriction is open or not, display accordingly
        if (!restriction.unblocked) blockPage.style = "display: block;";
        else                        blockPage.style = "display: none;";
    }

    
}

init();


// let style = document.createElement('style');
// document.body.appendChild(style);
// style.innerText = '#tabContent {overflow-y: auto; height: 80vh; overflow-x: hidden';

////////////////////////
//
//  Tab Functionality
//
////////////////////////
// var recommended_videos_loaded = false;
// var comments_loaded = false;
// var description_loaded = false;
// var expand_loaded = false;

// var recommended_videos;
// var comments;
// var description;
// var expand;

// var side_bar;
// var tabContent;

// var tabActive;

// // Add Secondary to tabs
// async function tabify() {
//     console.log(recommended_videos);
//     console.log(comments);
//     console.log(side_bar);

//     // Delete original instances of elements
//     comments.remove();
//     description.remove();
//     recommended_videos.remove();

//     // Creating Tabs and Tab links, and tab content
//     const tabs = document.createElement('div');
//     tabs.class = "tab";

//     // Making Buttons
//     const descriptionButton = document.createElement("button");
//     descriptionButton.className = "tabLink";
//     descriptionButton.textContent = "Description";
//     descriptionButton.addEventListener('click', function(){
//         if (tabActive == description) return;
//         description.style = "display:block;";
//         tabActive.style = "display:none;";
//         tabActive = description;
//     });

//     const recommendedButton = document.createElement("button");
//     recommendedButton.className = "tabLink";
//     recommendedButton.textContent = "Recommended";
//     recommendedButton.addEventListener('click', function(){
//         if (tabActive == recommended_videos) return;
//         recommended_videos.style = "display:block;";
//         tabActive.style = "display:none;";
//         tabActive = recommended_videos;
//     });

//     const commentsButton = document.createElement("button");
//     commentsButton.className = "tabLink";
//     commentsButton.textContent = "Comments";
//     commentsButton.addEventListener('click', function(){
//         if (tabActive == comments) return;
//         comments.style = "display:block;";
//         tabActive.style = "display:none;";
//         tabActive = comments;
//     });

//     tabs.append(recommendedButton);
//     tabs.append(commentsButton);
//     tabs.append(descriptionButton);


//     // Making tab content Container
//     tabContent = document.createElement("div");
//     tabContent.id = "tabContent";


//     /////////////////////////
//     //  Page Setup
//     /////////////////////////

//     // Default to recommended_videos
//     tabActive = recommended_videos

//     // Adding Tab Buttons to Page
//     side_bar.appendChild(tabs);
//     side_bar.appendChild(tabContent);
//     tabContent.append(comments);
//     tabContent.append(recommended_videos);
//     tabContent.append(description);

//     comments.style = "display:none;";
//     recommended_videos.style = "display:block;";
//     description.style = "display:none;";


//     // Click Description's Show more
//     console
//     expand.click();
// }

// // Func for Observer to Run when Mutation Observerd, gets comments, description, and recommended
// var callback = function (mutationsList, observer) {
//     for (let mutation of mutationsList) {
//         // Mutations list non zero
//         if (mutation.addedNodes.length) {

//             // Check if the mutation is the secondary-inner
//             if (!recommended_videos_loaded) {
//                 recommended_videos = document.getElementById("secondary-inner");
//                 if (recommended_videos) {
//                     // Found recommended Videos
//                     recommended_videos_loaded = true;

//                     // Set side bar to the parent
//                     side_bar = recommended_videos.parentElement;
//                 }

//                 return;
//             }

//             // Check if comments has loaded
//             if (!comments_loaded) {
//                 comments = document.getElementById("comments");
//                 if (comments) {
//                     // Found Comments
//                     comments_loaded = true;
//                 }

//                 return;
//             }


//             // Check if description has loaded
//             if (!description_loaded) {
//                 description = document.getElementById("bottom-row");
//                 if (description) {
//                     // Found Comments
//                     description_loaded = true;
//                 }

//                 return;
//             } 


//             if (!expand_loaded) {
//                 expand = document.getElementById("expand");
//                 if (expand) {
//                     //Found Expand Button
//                     expand_loaded = true;
//                 }

//                 return;
//             }

            

//             // Found both, tabify and disconect observer
//             if (comments_loaded && recommended_videos_loaded && description_loaded && expand_loaded) {
//                 tabify();

//                 console.log("Disconect");
//                 observer.disconnect();

//                 return;
//             }
//         }
//     }
// }

// // Create Observer and tell it where to look and what to do if theres a change
// var observer = new MutationObserver(callback);
// observer.observe(document, {childList: true, subtree: true});