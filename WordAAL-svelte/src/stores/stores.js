import {writable} from 'svelte/store';
import {NLETTER, NPOS} from '../lib/Consts.svelte';


export const targetWordStore = writable({cleartext: "", index: 0, chars: [0, 0, 0, 0, 0]});
export const strategyStore = writable();

// 0 in place, 1 exists, 2 not in word
// format: [[g,0], [u,1], [e,1], [s,0], [s,0], ... , ]
export const responseHistoryStore = writable([]);

export const responseStore = writable([]);
export const guessStore = writable("");

export const proposalsStore = writable();
export const hideProposalsStore = writable(false);
export const winTrigger = writable(false);
export const lossTrigger = writable(false);
export const gameInProgress = writable(false);
export const newGameTrigger = writable(false);
export const guessSubmitTrigger = writable(false);
export const debugModeStore = writable(true); //FIXME set to false when release

export const knowledgeStore = writable(new Array(NPOS));
export const knowledgeHtmlStore = writable();

export const sureLettersStore = writable(new Array(NPOS).fill(-1));

export const globalCountsStore = writable(new Array(NLETTER).fill(0));

