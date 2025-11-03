/**
 * RestrictionGroup class representing a group of url restrictions,
 * and the associated restriction settings
 * @param 
 */
class RestrictionGroup {
    constructor(group_name, urls, priority, pause_time, open_time, start_time, end_time, opens_total, open_reset) {
        // Group Name
        this.group_name = group_name;

        // Restrictions
        this.urls = urls;
        this.regex = [];
        for (var i = 0; i < urls.length; i++) {
            // Covert to Regex and store
            var url = urls[i];

            url = url.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            url = url.replace(/\./g, '\\.');
            url = url.replace(/\*/g, '.*');
            url = '^' + url + '$';
            
            this.regex.push(new RegExp(url));
        }

        // Restriction Settings 
        this.opens_total = opens_total;
        this.opens_left = opens_total;
        this.pause_time = pause_time;
        this.open_time = open_time;

        // Scheduling
        this.start_time = start_time;
        this.end_time = end_time;
        this.open_reset = open_reset

        // Other
        this.unblocked = false;
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
    static async getGroups() {
        let result = await chrome.storage.local.get("restriction_groups");

        return result.restriction_groups || [];
    }

    // Save Groups
    static async postGroups(groups) {
        // Store URLS
        await chrome.storage.local.set({"restriction_groups" : groups})
    }

    // Save Group
    static async postGroup(group) {
        // Retrive Groups
        let groups = await Groups.getGroups();

        groups[]
        // Store URLS
        await chrome.storage.local.set({"restriction_groups" : groups})
    }

    // Sorting comparitor for groups
    sort(a, b) {
        return a.priority - b.priority;
    }

    // Finds the matched URL in given list of URLS
    static async findMatch() {
        groups = Groups.getGroups();

        // Look through groups
        for (let i = 0; i < groups.length; i++) {
            // Look through regex websites
            for (let j = 0; j < groups.regex.length; i++) {
                // Found Match, stop searching
                if (window.location.href.match(groups[i].regex[j])) {
                    return true;
                }
            }
            
        }

        return false;
    }
}
