////////////////////////////
//
//  Timer Functions
//
////////////////////////////
class Timer {
    static TimerType = {
        Pause   :   Symbol("Pause"),
        Open    :   Symbol("Open")
    }

    /**
     * Responsible for starting a timer and calling the relevant endTimer
     * @param {*} group Group that the timer is associated
     * @param {*} timerType Either Pause or Open timer
     */
    static async startTimer(group, timerType) {
        // Start Pause Timer
        if (timerType == Timer.TimerType.Pause) {
            console.log("Starting Pause Timer");
            setTimeout(() => Timer.endTimer(group, timerType), group.pause_time * 1000);
        }

        // Start Open Timer
        else if (timerType == Timer.TimerType.Open) {
            console.log("Starting Open Timer");
            setTimeout(() => Timer.endTimer(group, timerType), group.open_time * 60000);
        }
    }

    /**
     * Responsible for calling the correct un/block logic and
     * starting a new timer
     * @param {*} group Group whos timer just ended
     * @param {*} timerType Pause or Open timer
     */
    static async endTimer(group, timerType) {
        // End Pause Timer, Unblock
        if (timerType == Timer.TimerType.Pause) {
            // Unblock Logic
            await Timer.unblock(group);
            
            // Start Open Timer
            Timer.startTimer(group, Timer.TimerType.Open);
        }

        // End Open Timer, Block
        else if (timerType == Timer.TimerType.Open) {
            console.log("Ending Timer");
            // Block
            await Timer.block(group);

            console.log("Timer Ended");
        }
    }

    /**
     * Function responsible for the unblocking logic of a page
     * @param {*} group The group that will be unblocked
     */
    static async unblock(group) {
        // Use an Open and unblock
        group.opens_left -= 1;
        group.blocked = false;

        // Post Group
        await Groups.postGroup(group);

        // Remove Block
        document.getElementById(BLOCK_DIV_ID).style.visibility = "hidden";
    }

    /**
     * Function responsible for the blocking logic of a page
     * @param {*} group The group that will be blocked
     */
    static async block(group) {
        console.log("Hello");
        // Block Group
        group.blocked = true;

        // Post Group
        await Groups.postGroup(group);

        // Remove Block
        document.getElementById(BLOCK_DIV_ID).style.visibility = "visible";

        console.log("Goodbye");
    }
}
