import { useState } from "react";

// last searches, kept in the browser only
const KEY = "safeway_recent_searches";
const MAX_SEARCHES = 8;

function load() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        return [];
    }
}

function save(list) {
    try {
        localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
        // storage blocked, just keep them in memory
    }
}

export function useRecentSearches() {
    const [searches, setSearches] = useState(load);

    function update(list) {
        setSearches(list);
        save(list);
    }

    function addSearch(from, to) {
        const others = searches.filter((s) => !(s.from === from && s.to === to));
        update([{ from, to, date: new Date().toISOString() }, ...others].slice(0, MAX_SEARCHES));
    }

    function clearAll() {
        update([]);
    }

    return { searches, addSearch, clearAll };
}
