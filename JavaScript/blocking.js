////////////////////////////
//
//  Global Data
//
////////////////////////////
const BLOCK_DIV_ID = "blockPageBackground";


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

    // Get Match, or null
    matchedGroups = await Groups.findMatch();

    // Found a match, block
    if (matchedGroups.length > 0) {
        console.log("Match");
        console.log(matchedGroups);

        // TODO: add logic to check which group is active/highest priority
        let group = null;

        for (const groupCanidate of matchedGroups) {
            // Skip inactiive groups
            if (!RestrictionGroup.isActive(groupCanidate)) continue;

            // If no group selected, or found higher priority group
            if (group == null || groupCanidate.priority > group.priority) {
                group = groupCanidate;
            }
        }

        // No group was active
        if (group == null) return;
        

        //////////////////
        //  Make Block
        //////////////////

        // Create Background
        blockPage = document.createElement('div');
        blockPage.id = BLOCK_DIV_ID;
        document.body.appendChild(blockPage);

        blockPage_Body = document.createElement('div');
        blockPage_Body.id = "block_Body"
        blockPage_Body.className = "sageContainer";
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
        let opens_left = group.opens_left;
        open_text.textContent = "Opens: " + opens_left + "/" + group.opens_total;
        blockPage_Body.append(open_text);

        // Create Unblock Button
        const requestUnblock = document.createElement("button");
        requestUnblock.className = "button mintContainer";
        requestUnblock.id = "unlock_button";

        // If we have opens
        requestUnblock.textContent = "Unblock? " + group.pause_time + "s";
        requestUnblock.addEventListener('click', () => {
            // Using last open
            if (group.opens_left == 1) {
                requestUnblock.textContent = "Blocked";
            }

            if (group.opens_left > 0) {
                opens_left -= 1;
                open_text.textContent = "Opens: " + opens_left + "/" + group.opens_total;
                Timer.startTimer(group, Timer.TimerType.Pause);
            }
            else {
                // Do nothing
            }
            
            
        });
        blockPage_Body.append(requestUnblock);

        // TODO: Display Forest

        // Check if restriction is open or not, display accordingly
        if (group.blocked)   blockPage.style.visibility='visible';
        else                  blockPage.style.visibility='hidden';
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
