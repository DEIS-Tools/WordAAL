import {writable} from 'svelte/store';
import {NLETTER, NPOS, WORDS, INDEX_LAST_CURATED_WORD} from '../lib/Consts.svelte';


export const targetWordStore = writable({cleartext: "", index: 0, chars: [0, 0, 0, 0, 0]});
export const strategyStore = writable();

// 0 in place, 1 exists, 2 not in word
// format: [[g,0], [u,1], [e,1], [s,0], [s,0], ... , ]
export const responseHistoryStore = writable([]);


/*export function initRandomResponseHistoryStore() {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let responseHistory = [];
    for (let i = 0; i < 3; i++) {
        let word = WORDS[getRandomInt(0, INDEX_LAST_CURATED_WORD)];
        word.forEach((elem, i, arr) => arr[i] = [elem, getRandomInt(0, 2)]);
        responseHistory.push(word);
    }
    responseHistoryStore.set(responseHistory);
}*/

export const responseStore = writable([]);
export const guessStore = writable("");

export const proposalsStore = writable();

export const newGameTrigger = writable(false);
export const guessSubmitTrigger = writable(false);

