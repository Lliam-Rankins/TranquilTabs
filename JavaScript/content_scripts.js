////////////////////////////
//
//  Global Data
//
////////////////////////////
let group_list;
let matched_restriction;
let blockPage;

const BLOCK_DIV_ID = "blockPageBackground";

////////////////////////////
//
//  Timer Functions
//
////////////////////////////
const TimerType = {
    Pause   :   Symbol("Pause"),
    Open    :   Symbol("Open")
}

async function startTimer(group, timerType) {
    // Start Pause Timer
    if (timerType == TimerType.Pause) {
        console.log("Starting Pause Timer");
        setTimeout(endTimer, group.pause_time * 1000, group, timerType);
    }

    // Start Open Timer
    else if (timerType == TimerType.Open) {
        console.log("Starting Open Timer");
        setTimeout(endTimer, group.open_time * 60000, group, timerType);
    }
}

async function endTimer(group, timerType) {
    // End Pause Timer, Unblock
    if (timerType == TimerType.Pause) {
        // Unblock Logic
        unblock(group);
        
        // Start Open Timer
        startTimer(group, TimerType.Open);
    }

    // End Open Timer, Block
    else if (timerType == TimerType.Open) {
        // Block
        block(group);
    }
}

async function unblock(group) {
    // Use an Open and unblock
    group.opens_left -= 1;
    group.blocked = false;

    // Post Group
    Groups.postGroup(group);

    // Remove Block
    document.getElementById(BLOCK_DIV_ID).style.visibility = "hidden";
}

async function block(group) {
    // Block Group
    group.blocked = true;

    // Post Group
    Groups.postGroup(group);

    // Remove Block
    document.getElementById(BLOCK_DIV_ID).style.visibility = "visible";
}

////////////////////////////
//
//  Listeners
//
////////////////////////////


////////////////////////////
//
//  Initialize Function
//
////////////////////////////
async function init() {
    ////////////////////////////
    //
    //  Block Page
    //
    ////////////////////////////

    // Get Match, or null
    group = await Groups.findMatch();

    // Found a match, block
    if (group.length > 0) {
        console.log("Match");
        console.log(group);
        // TODO: add logic to check if active
        group = group[0];

        //////////////////
        //  Make Block
        //////////////////

        // Create Background
        blockPage = document.createElement('div');
        blockPage.id = BLOCK_DIV_ID;
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
        requestUnblock.addEventListener('click', () => startTimer(group, TimerType.Pause));
        blockPage_Body.append(requestUnblock);

        // Check if restriction is open or not, display accordingly
        if (group.blocked)   blockPage.style.visibility='visible';
        else                  blockPage.style.visibility='hidden';
    }

    
}

init();