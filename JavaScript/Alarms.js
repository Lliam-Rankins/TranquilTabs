/**
 * Class used to manage the stored Alarm list for startup persistance
 */
class AlarmList {
    // Key for accessing next ID 
    static ALARM_LIST_KEY = "alarmList";

    // Key for daily reset timestamp
    static DAILY_RESET_KEY = "dailyResetTime";

    /**
     * Returns the list of stored alarm details
     */
    static async getAlarms() {
        // Get the list of alarms
        let result = await chrome.storage.local.get(this.ALARM_LIST_KEY);

        return result[this.ALARM_LIST_KEY] || []
    }

    /**
     * Replaces the current alarm list with the given one
     * @param {*} alarmList new alarm list
     */
    static async postAlarms(alarmList) {
        // Post Alarms
        await chrome.storage.local.set({[this.ALARM_LIST_KEY]: alarmList});
    }

    /**
     * Posts the given alarm
     */
    static async postAlarm(alarm) {
        // Get the list of alarms
        let alarmList = await AlarmList.getAlarms();

        // Add new alarm
        alarmList.push(alarm);

        // Post Alarms
        await AlarmList.postAlarms(alarmList);
    }

    /**
     * Removes the specified alarm
     */
    static async removeAlarm(alarm) {
        console.log("Removing alarm");

        // Get the current list of alarms
        let alarmList = await AlarmList.getAlarms();

        // Filter out alarm
        alarmList = alarmList.filter(a => a.name !== alarm.name);

        // Store updated list
        await AlarmList.postAlarms(alarmList);
    }


    /**
     * Creates the daily alarm and stores it
     */
    static async createDailyAlarm() {
        // See if daily alarm already exists
        let existing = await chrome.alarms.get("DailyReset");
        if (existing) return;


        // Start alarm
        let currTime = new Date();
        let alarmTime = new Date();
        alarmTime.setHours(2, 0, 0, 0);

        // Already passed 2 AM
        if (currTime > alarmTime) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }

        // Make the alarm
        await chrome.alarms.create("DailyReset",
            // (alarmTime.getTime() - currTime.getTime()) / 1000 / 60
            {
                // Delay is minutes until next 2 am 
                delayInMinutes: (alarmTime.getTime() - currTime.getTime()) / 1000 / 60,
            }
        );

        // Store the next timestamp for daily alarm
        await chrome.storage.local.set({
            [this.DAILY_RESET_KEY]: alarmTime.getTime()
        });
    }
}

export {AlarmList};