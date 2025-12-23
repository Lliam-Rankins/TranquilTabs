/**
 * RestrictionGroup class representing a group of url restrictions,
 * and the associated restriction settings
 * @param 
 */
class RestrictionGroup {
    /**
     * Constructor for creating a Restriction Group, representing a collection of Urls and their
     * associted restrictions and time frames.
     * @param {*} group_name    String name of the group
     * @param {*} id            Unique id of the group, due to volitility of name
     * @param {*} urls          Plain text list of urls that are restricted
     * @param {*} priority      Used for ranking which restriction is applied when 2+ groups are valid
     * @param {*} pause_time    Seconds user must wait before getting access to a group
     * @param {*} open_time     Minutes user is allowed to access the group
     * @param {*} weekdays      What days of the week the group is valid
     * @param {*} start_time    Time of the day when the restriction becomes active
     * @param {*} end_time      Time of the day when the restriction becomes inactive
     * @param {*} opens_total   Number of opens the user has in a given reset winow
     * @param {*} open_reset    At what interval the user's opens reset, ie daily, weekly, bi-weekly or monthy
     */
    constructor(group_name, id, urls, priority, pause_time, open_time, weekdays, start_time, end_time, opens_total, open_reset) {
        // Group Name
        this.group_name = group_name;

        this.id = id;
        this.priority = (priority == undefined || priority == null) ? this.id : priority;

        // Restrictions and Regex (stored as a pattern)
        this.urls = urls || [];
        this.regex = [];

        for (const url of this.urls) {
            this.regex.push(RestrictionGroup.urlToRegex(url));
        }

        // Restriction Settings 
        this.opens_total = opens_total;
        this.opens_left = opens_total;
        this.pause_time = pause_time;
        this.open_time = open_time;

        // Scheduling
        this.weekdays = weekdays;
        this.start_time = start_time;
        this.end_time = end_time;
        this.open_reset = open_reset

        // Other
        this.blocked = true;
        
        this.streak_start_date = new Date().toDateString();
    }

    // Adds a restriction to the list
    addUrl(url) {
        // Adds Url
        this.urls.push(url);

        // Adds Regex Pattern
        this.regex.push(RestrictionGroup.urlToRegex(url));
    }

    // Removes a restriction from the list
    removeUrl(url) {
        // Removes the Url
        var urlIdx = this.urls.indexOf(url);
        if (urlIdx != -1) {
            this.urls.splice(urlIdx, 1);
        }

        // Removes Regex Pattern
        var regexIdx = this.regex.indexOf(RestrictionGroup.urlToRegex(url));
        if (regexIdx != -1) {
            this.regex.splice(regexIdx, 1);
        }
    }

    // Returns list of url restrictions
    getUrls() {
        return this.urls;
    }

    // Translate Url string into a regex pattern
    static urlToRegex(url) {
        url = url.replace(/[-/\\^$+?{}()|[\]]/g, '\\$&');
        url = url.replace(/\*/g, '.*');
        url = '^' + url + '$';

        return url;
    }

    //////////////////////////
    //  Timing
    //////////////////////////
    static dateToMillis(date) {
        return  date.getHours() * 3600000 +
                date.getMinutes() * 60000 +
                date.getSeconds() * 1000 +
                date.getMilliseconds()
    }

    static isActive(group) {
        // Get Current Time
        const currTime =    this.dateToMillis(new Date());
        const startTime =   this.dateToMillis(new Date("1970-01-01T" + group.start_time));
        const endTime =     this.dateToMillis(new Date("1970-01-01T" + group.end_time));

        console.log(startTime + " : " + currTime + " : " + endTime);

        // If currTime is between start and end time, true
        if (startTime < currTime && currTime < endTime) return true;
        else return false;
    }

    /*
    *   Returns the current date with hours, minutes, and seconds all 0;
    */
    static getStreak(dateString) {
        let startDate = new Date(dateString);
        let todayDate = new Date();

        return Math.floor((todayDate - startDate) / (1000 * 3600 * 24));
    }
}

class Groups {
    //////////////////////////
    //  ID Handling
    //////////////////////////
    
    // Key for accessing next ID 
    static ID_KEY = "Next_ID";

    // Gets the next id for a new restriction group, and stores 1 higher
    static async getNextID() {
        // Get the next key, or nothing{ Set 0, if nothing }
        let result = await chrome.storage.local.get(Groups.ID_KEY);

        let key = parseInt(result[Groups.ID_KEY]) || 1;

        // Increment and store for next key
        let nextKey = key + 1
        await chrome.storage.local.set({[Groups.ID_KEY] : nextKey});

        return key;
    }

    // Returns the next key id
    static async peekNextID() {
        let result = await chrome.storage.local.get(Groups.ID_KEY);

        return parseInt(result[Groups.ID_KEY]) || 1;
    }


    //////////////////////////
    //  Group Handling
    //////////////////////////

    // Key for accessing restriction groups
    static RESTRICTION_GROUPS_KEY = "restriction_groups";

    // Returns the groups
    static async getGroups() {
        let result = await chrome.storage.local.get(Groups.RESTRICTION_GROUPS_KEY);

        return result[Groups.RESTRICTION_GROUPS_KEY] || [];
    }

    // Returns Specific group based on id
    static async getGroup(id) {
        const groups = await Groups.getGroups();

        let result = null;
        for (let group of groups) {
            if (group.id == id) {
                result = group;
                break;
            }
        }

        
        return result;
    }

    // Save Groups
    static async postGroups(groups) {
        // Store URLS
        await chrome.storage.local.set({[Groups.RESTRICTION_GROUPS_KEY] : groups})
    }

    // Save Group
    static async postGroup(group) {
        // Retrive Groups
        let groups = await Groups.getGroups();

        // See if we have the group
        let idx = groups.findIndex(g => g.id == group.id);

        // Existing Group
        if (idx != -1) {
            groups[idx] = group;
            console.log("Existing Group, updated");
        }
        // Group doesnt exist
        else {
            groups.push(group);
            console.log("New Group, added");
        }

        // Store URLS
        Groups.postGroups(groups);
    }

    // Delete Group
    static async removeGroup(id) {
        // Retrive Groups
        let groups = await Groups.getGroups();

        // See if we have the group
        let idx = groups.findIndex(g => g.id == id);

        // Existing Group
        if (idx == -1) return;

        groups.splice(idx, 1);
        console.log("Removed Group");

        // Store Groups
        Groups.postGroups(groups);
    }


    //////////////////////////
    //  Helper
    //////////////////////////

    // Finds the matched URL in given list of URLS
    static async findMatch() {
        let groups = await Groups.getGroups();

        let matched_groups = [];

        // Look through groups
        for (const group of groups) {
            // Look through regex websites
            for (const regex of group.regex) {
                // Found Match, add to matched groups
                if (window.location.href.match(new RegExp(regex))) {
                    matched_groups.push(group);
                }
            }
        }

        return matched_groups;
    }


    // Find next highest priority and swap with given group
    static async swapHigher(restrictionGroup) {
        let groups = await Groups.getGroups();
        let nextHighestPriority = Infinity;
        let nextHighest = null;

        // Find next highest priority group
        for (const group of groups) {
            // Found a higher priority
            // Canidate priority is greater than the passed in's, while also less than highest found so far
            if (group.priority > restrictionGroup.priority && group.priority < nextHighestPriority) {
                nextHighestPriority = group.priority;
                nextHighest = group;
            }
        }


        // Swap their prioritys, post both groups
        if (nextHighest != null) {
            nextHighest.priority = restrictionGroup.priority;
            restrictionGroup.priority = nextHighestPriority;

            console.log(nextHighest.priority);
            console.log(restrictionGroup.priority)

            await Groups.postGroup(nextHighest);
            await Groups.postGroup(restrictionGroup);
        }   
    }

    // Find next lowest priority and swap with given group
    static async swapLower(restrictionGroup) {
        let groups = await Groups.getGroups();
        let nextLowestPriority = -Infinity;
        let nextLowest = null;

        // Find next lowest priority group
        for (const group of groups) {
            // Found a lower priority
            // Canidate priority is less than the passed in's, while also greater than lowest found so far
            if (group.priority < restrictionGroup.priority && group.priority > nextLowestPriority) {
                nextLowestPriority = group.priority;
                nextLowest = group;
            }
        }


        // Swap their prioritys, post both groups
        if (nextLowest != null) {
            nextLowest.priority = restrictionGroup.priority;
            restrictionGroup.priority = nextLowestPriority;

            await Groups.postGroup(nextLowest);
            await Groups.postGroup(restrictionGroup);
        }   
    }
}
