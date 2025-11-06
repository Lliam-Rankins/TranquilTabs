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
        this.streak = 0;
        this.priority = priority;
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
    static async isActive(group) {
        // Get Current Time
        const currTime =    new Date();
        const startTime =   new Date("1970-01-01T" + group.start_time);
        const endTime =     new Date("1970-01-01T" + group.end_time);

        // If currTime is between start and end time, true
        if (startTime < currTime && currTime < endTime) return true;
        else return false;
    }
}

class Groups {
    //////////////////////////
    //  ID Handling
    //////////////////////////
    
    // Key for accessing next ID 
    static ID_KEY = "Next_ID";

    // Gets the next id for a new restriction group
    static async getNextID() {
        // Get the next key, or nothing{ Set 0, if nothing }
        let result = await chrome.storage.local.get(Groups.ID_KEY);

        let key = parseInt(result[Groups.ID_KEY]) || 0;

        // Increment and store for next key
        let nextKey = key + 1
        await chrome.storage.local.set({[Groups.ID_KEY] : nextKey});

        return key;
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
}
