/**
 * RestrictionGroup class representing a group of url restrictions,
 * and the associated restriction settings
 * @param 
 */
class RestrictionGroup {
    constructor(group_name, id, urls, priority, pause_time, open_time, weekdays, start_time, end_time, opens_total, open_reset) {
        // Group Name
        this.group_name = group_name;

        this.id = id;

        // Restrictions
        this.urls = urls || [];
        this.regex = [];


        for (const storedUrl of this.urls) {
            // Covert to Regex and store
            var url = storedUrl;

            url = url.replace(/[-/\\^$+?{}()|[\]]/g, '\\$&');
            url = url.replace(/\*/g, '.*');
            url = '^' + url + '$';
            
            this.regex.push(url);
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
    addRestriction(restriction) {
        this.restrictions.push(restriction);
    }

    // Removes a restriction from the list
    removeRestriction(restriction) {
        var idx = this.restrictions.indexOf(restriction);
        if (idx !== -1) {
            this.restrictions.splice(idx, 1);
        }
    }

    // Returns list of restrictions
    getRestrictions() {
        return this.restrictions;
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
            console.log(group);
            // Look through regex websites
            for (const regex of group.regex) {
                console.log(new RegExp(regex));
                // Found Match, add to matched groups
                if (window.location.href.match(new RegExp(regex))) {
                    matched_groups.push(group);
                    console.log("Matched");
                }
            }
        }

        return matched_groups;
    }
}
