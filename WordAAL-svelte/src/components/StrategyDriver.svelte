<script lang="ts">

    import {
        NLETTER,
        NPOS,
        NWORDS,
        WORDS,
        convertStringToCharArray,
    } from "../lib/Consts.svelte";
    import {
        proposalsStore,
        responseHistoryStore,
        strategyStore,
        newGameTrigger,
        knowledgeStore,
        sureLettersStore,
        globalCountsStore,
        hideProposalsStore,
        gameInProgress,
        winTrigger,
        lossTrigger,
        knowledgeHtmlStore,
    } from "../stores/stores.js";
    import Snackbar, {Label} from '@smui/snackbar';


    let snackbarDriverInfo: Snackbar;
    let snackbarDriverInfoText = "";

    let snackbarDriverError: Snackbar;
    let snackbarDriverErrorText = "";

    let strategyJSON = [];
    let strategy;
    let mode;
    let staticPath = "strategies/";

    let knowledge_html;

    const Response = {
        SURELY_NOT: -1,
        MAYBE: 0,
        SURELY: 1
    }

    // used for caching hardmode words
    let hard = new Array(NWORDS).fill(true);

    // counts of maximal number of occurrences for each letter observed in a single word
    let globalCounts = new Array(NLETTER).fill(0);

    // init: confident placement of letters
    let sureLetters = new Array(NPOS).fill(-1);

    // init: knowledge array
    let knowledge = new Array(NPOS);
    for (let i = 0; i < NPOS; ++i) {
        knowledge[i] = new Array(NLETTER).fill(0);
    }

    function reset() {
        // used for caching hardmode words
        hard = new Array(NWORDS).fill(true);

        // counts of maximal number of occurrences for each letter observed in a single word
        globalCounts = new Array(NLETTER).fill(0);

        // init: confident placement of letters
        sureLetters = new Array(NPOS).fill(-1);

        // init: knowledge array
        knowledge = new Array(NPOS);
        for (let i = 0; i < NPOS; ++i) {
            knowledge[i] = new Array(NLETTER).fill(0);
        }
    }

    function rollbackCurrentGuess() {
        console.warn("driver: resetting current/last guess due to inconsistency error");
        if ($responseHistoryStore.length > 0) {
            $responseHistoryStore.pop();
            responseHistoryStore.set($responseHistoryStore);
        }
    }

    $: {
        if ($newGameTrigger) {
            console.error("Hit new game trigger in driver")
            reset();
            newGameTrigger.set(false);
        }
    }

    function parseStrategyConfigEvent(store) {
        mode = store['hard'];
        if (mode) {
            staticPath += store.s.location_hard;
        } else {
            staticPath += store.s.location;
        }

        loadStrategoStrategyJSON(staticPath).then((json) => {
            strategyJSON = json;
            showWords();
        }).catch((error) => {
            console.error("Error loading strategy: " + error);
        });
        // reset path for reload of another strategy
        staticPath = "strategies/";

        // map strat to legacy; comb=2 || cons=0 || perm=1
        if (store.s.name === "conservative") {
            strategy = 0;
        } else if (store.s.name === "permissive") {
            strategy = 1;
        } else if (store.s.name === "combined") {
            strategy = 2;
        }
    }

    $: {
        if ($strategyStore !== undefined) {
            parseStrategyConfigEvent($strategyStore);
        }
    }

    async function loadStrategoStrategyJSON(path) {
        if (!('caches' in window)) {
            // Caches API not available, fetch directly
            let response = await fetch(path);

            return await response.json();
        }

        const cache = await caches.open("wordaalStrategiesCache");

        // Try to get the response from the cache
        let cachedResponse = await cache.match(path);

        if (cachedResponse && cachedResponse.ok) {
            // cachedResponse is a Response object, we need to parse it to json
            return await cachedResponse.json();
        } else {
            // If not found in cache, fetch from network and cache it
            let response = await fetch(path);
            if (response.ok) {
                let clonedResponse = response.clone();
                cache.put(path, clonedResponse);
            }
            return await response.json();
        }
    }

    function updateCount(guess, response) {
        // init zeroed local counts
        let local_counts = new Array(NLETTER).fill(0);

        // if response not absent at position, then increment local count
        for (let position = 0; position < NPOS; ++position)
            if (response[position] != 2) { //TYPE COERCION!!! response is a string, not a number
                local_counts[guess[position]] += 1;
            }

        // update global counts
        for (let letter = 0; letter < NLETTER; ++letter) {
            globalCounts[letter] = Math.max(globalCounts[letter], local_counts[letter]);
        }
    }

    function updateHints(guess, response) {
        // given a guess and response, update all sure letters
        for (let p = 0; p < NPOS; ++p)
            if (response[p] == 0) {
                sureLetters[p] = guess[p];
            }
    }

    function updateHard() {
        let localCounts = new Array(NLETTER);
        for (let w = 0; w < NWORDS; ++w) {
            if (hard[w]) { //fixme, simplify by only checking hard words?

                // copy global counts
                for (let letter = 0; letter < NLETTER; ++letter)
                    localCounts[letter] = globalCounts[letter];

                // for each word position
                for (let p = 0; p < NPOS; ++p) {
                    // if we have a hint at this position for word w, and word w position is not the same as the hint
                    if (sureLetters[p] != -1 && WORDS[w][p] != sureLetters[p]) {
                        hard[w] = false; // we did not use the position-hints!
                    }
                    // todo, why??
                    --localCounts[WORDS[w][p]];
                }

                for (let l = 0; l < NLETTER; ++l) {
                    if (localCounts[l] > 0)
                        hard[w] = false; // we did not use all the hints!
                }
            }
        }
    }

    function updateConservative(response, guess) {
        console.log("update conservative", response, guess);
        for (let pos = 0; pos < NPOS; ++pos) {
            let currGuessLetter = guess[pos];
            if (response[pos] == 0) { // letter p in guess is correctly placed
                // set all letters to SURELY-NOT in this position
                for (let l = 0; l < NLETTER; ++l)
                    knowledge[pos][l] = Response.SURELY_NOT;
                // mark the guess-letter as SURELY present in this position
                knowledge[pos][currGuessLetter] = Response.SURELY;

            } else if (response[pos] == 1) { // incorrectly placed
                // mark this letter SURELY-NOT in this position in this position
                knowledge[pos][currGuessLetter] = Response.SURELY_NOT;

            } else if (response[pos] == 2) { // does not appear at all
                if (globalCounts[currGuessLetter] == 0) {
                    for (let q = 0; q < NPOS; ++q)
                        // mark this letter absent in all positions in knowledge
                        knowledge[q][currGuessLetter] = Response.SURELY_NOT;
                } else {
                    // appears, but not in this position
                    knowledge[pos][currGuessLetter] = Response.SURELY_NOT;
                    // check if for every other pos with same letter, that letter is not maybe
                    let all_ok = true;
                    for (let q = 0; q < NPOS; ++q) {
                        // TYPE COERCION below, response is a string, NaN
                        all_ok &= (guess[q] != currGuessLetter || response[q] != 1);
                        if (!all_ok) break;
                    }
                    if (all_ok) {
                        // all are correctly placed i.e not MAYBE
                        for (let q = 0; q < NPOS; ++q)
                            if (guess[q] != currGuessLetter || response[q] != 0)
                                knowledge[q][currGuessLetter] = -1;
                    }
                }
            }
        }
    }


    function checkSums() {
        let localCounts = new Array(NLETTER);
        for (let changed = true; changed; /*nothing*/ changed) {
            changed = false;
            for (let l = 0; l < NLETTER; ++l)
                localCounts[l] = globalCounts[l];
            // check if there is only one unknown letter left
            for (let p = 0; p < NPOS; ++p) {
                let letter_sum = 0;
                let letter = 0;
                for (let l = 0; l < NLETTER; ++l) {
                    if (knowledge[p][l] != -1) {
                        letter = l;
                        letter_sum += 1;
                    }
                }
                if (letter_sum == 1 && knowledge[p][letter] != 1) { // new information!

                    knowledge[p][letter] = 1;
                    changed = true;
                }
                if (letter_sum == 1) {
                    --localCounts[letter];
                }
            }
            let sm = 0;
            for (let l = 0; l < NLETTER; ++l)
                sm += globalCounts[l];
            if (sm == NPOS) {
                // we can remove all that are not consistent with the 5 known letters
                for (let p = 0; p < NPOS; ++p) {
                    for (let l = 0; l <= NLETTER; ++l) {
                        if (knowledge[p][l] != 1 && globalCounts[l] == 0) {
                            knowledge[p][l] = -1;
                        }
                    }
                }
            }
        }
    }


    function updatePermissive(response, guess) {
        updateConservative(response, guess);
        checkSums();
    }

    function wordWid(guess) {
        for (let w = 0; w < NWORDS; ++w) {
            let ok = true;
            for (let p = 0; p < NPOS; ++p) {
                if (guess[p] !== WORDS[w][p])
                    ok = false;
            }
            if (ok) return w;
        }
        return null;
    }

    function consistent(wid) {
        // comb=2 || cons=0
        if (strategy === 0 || strategy === 2) {
            for (let p = 0; p < NPOS; ++p) {
                if (knowledge[p][WORDS[wid][p]] === -1) {
                    let error = "Uses invalid character '" + String.fromCharCode(97 + WORDS[wid][p]) + "' at position " + p + " (combined or conservative)";
                    if (wid === 1303)
                        console.error(error);
                    return error;
                }
            }
        }
        // comb=2 || perm=1
        if (strategy === 1 || strategy === 2) {
            let new_knowledge = false;
            let correct = true;
            for (let p = 0; p < NPOS; ++p) {
                if (knowledge[p][WORDS[wid][p]] !== 1)
                    correct = false;
                if (knowledge[p][WORDS[wid][p]] === 0)
                    new_knowledge = true;
            }
            if (!(new_knowledge || correct)) {
                let error = "The word contains no new information (combined or permissive)";
                if (wid === 1303)
                    console.error(error);
                return error;
            }
        }
        return null;
    }

    function updateAal() {

        if ($responseHistoryStore.length === 0) {
            console.error("driver: no response history - cannot update")
            return;
        }
        let last = $responseHistoryStore[$responseHistoryStore.length - 1];
        let guess = last.map((x) => x[0]).join("");
        let response = last.map((x) => x[1]).join("");

        if (response.length !== NPOS) {
            alert("Need 5 characters in response");
            return;
        }
        if (guess.length !== NPOS) {
            alert("Need 5 characters in guess");
            return;
        }
        if (response.match(/\D/)) {
            alert("Need only numbers");
            return;
        }

        // convert ascii guess to zero-indexed guess (a=0, b=1)
        let num_guess = new Array(NPOS);
        for (let p = 0; p < NPOS; ++p)
            num_guess[p] = guess.charCodeAt(p) - 97;


        // lookup word in wordlist
        let wid = wordWid(num_guess);
        if (wid === null) {
            snackbarDriverInfoText = "Word is not in word-list '" + guess + "'. Should've been caught by Game-component";
            snackbarDriverInfo.open();
            rollbackCurrentGuess();
            return;
        }

        if (mode) {
            if (!hard[wid]) {
                snackbarDriverErrorText = "Word is not hard '" + guess + "'";
                snackbarDriverError.open();
                rollbackCurrentGuess();
                return;
            }
        }
        let has_error = consistent(wid);
        if (has_error !== null) {
            snackbarDriverErrorText = "Word is not consistent with game-mode. '" + guess + "' " + has_error;
            snackbarDriverError.open();
            rollbackCurrentGuess();
            return;
        }

        updateCount(num_guess, response);
        updateHints(num_guess, response);

        console.log("updateAal: mode", mode, "strategy", strategy, "response", response, "num_guess", num_guess);
        if (mode) updateHard();
        if (strategy === 0) {
            updateConservative(response, num_guess);
        }
        if (strategy === 1 || strategy === 2) {
            updatePermissive(response, num_guess);
        }
        displayKnowledge();
        // update state into store for use in highlighting in game component
        knowledgeStore.set(knowledge);
        sureLettersStore.set(sureLetters);
        globalCountsStore.set(globalCounts);
        showWords();
        return true;
    }

    function lookup(regressor) {
        if (typeof (regressor) === 'object') {
            let pv = strategyJSON["pointvars"][regressor["var"]].substring(5);
            let val = eval(pv); //fixme: jank lookup, might be similar to strategy_lookup fix
            if (val <= regressor["bound"])
                return lookup(regressor["low"]);
            else
                return lookup(regressor["high"]);
        } else {
            return regressor;
        }
    }

    function strategyLookup(wid) {
        // fixme; jank method to create statevar string
        let sv = "(";
        if (strategyJSON["statevars"].length !== 0) {
            for (let i = 0; i < strategyJSON["statevars"].length; i++) {
                if (i !== 0) {
                    sv += ",";
                }
                sv += globalCounts[i];
            }
            sv += ")";
        } else {
            sv = "(1)";
        }

        if (strategyJSON["regressors"][sv] === undefined) {
            return Infinity;
        } else {
            return lookup(strategyJSON["regressors"][sv]["regressor"][String(wid)]);
        }
    }

    function bestAction() {
        if (strategyJSON === null) return Infinity;
        let mn = Infinity;
        for (let wid = 0; wid < NWORDS; ++wid) {
            if (consistent(wid) === null && (mode === 0 || hard[wid])) {
                mn = Math.min(mn, strategyLookup(wid));
            }
        }
        return mn;
    }

    function showWords() {
        let best = bestAction();
        let prev_proposals = $proposalsStore;
        let proposals = [];
        const correctLetters = sureLetters.reduce(function (acc, curr) {
            return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, {});
        const combKnowledge = knowledge.reduce((acc, curr) => {
            return acc.map((value, index) => Math.max(value, curr[index]));
        });

        let duplicateHints = new Array(NLETTER).fill(0);

        // get wordWids for all words in responseHistory
        let responseHistoryWids = [];
        for (let i = 0; i < $responseHistoryStore.length; i++) {
            let guess = $responseHistoryStore[i].map((x) => x[0]).join("");
            let num_guess = convertStringToCharArray(guess);
            responseHistoryWids.push(wordWid(num_guess));
        }

        for (let wid = 0; wid < NWORDS; ++wid) {
            // knowledge: 0 = green, 1 = yellow, 2 = grey, 3 = white
            let word = {wid: wid, word: "", knowledge: [3, 3, 3, 3, 3], cost: Infinity};

            // reset duplicate hints
            duplicateHints.fill(0);

            // if word is in any responseHistory, then skip
            if (responseHistoryWids.includes(wid)) {
                continue;
            }

            if (wid == 1303) {
                console.log("1303 is consistent: ", consistent(wid))
            }

            if (consistent(wid) === null && (mode === 0 || hard[wid])) {
                // for NPOS; for NLETTER, if knowledge[p][l] is 1, then correct and put knowledge 0 to word

                for (let n = 0; n < NPOS; n++) {
                    let char = WORDS[wid][n];
                    // if definitely not in target word, set knowledge to 2
                    if (combKnowledge[char] === -1) {
                        word["knowledge"][n] = 2;
                    }

                    // if counts for current letter is positive and is not a sure letter, then set knowledge to 1
                    if ((globalCounts[char] > (correctLetters[char] || 0)) && duplicateHints[char] === 0) {
                        duplicateHints[char]++;
                        // FIXME only do this for the number of times the letter appears in the target word
                        word["knowledge"][n] = 1;
                    }

                    if (knowledge[n][char] === Response.SURELY) {
                        word["knowledge"][n] = 0;
                    }
                    word["word"] += String.fromCharCode(97 + char);
                }

                word['cost'] = strategyLookup(wid);

                proposals.push(word);
            } else {
                // word is not consistent
                // convert word to string
                let wordString = "";
                for (let i = 0; i < NPOS; i++) {
                    wordString += String.fromCharCode(97 + WORDS[wid][i]);
                }
            }
        }

        proposals.sort((a, b) => {
            return a.cost - b.cost;
        });

        console.log("number of proposals: " + proposals.length + " best action: " + best)
        console.log(proposals)

        proposalsStore.set(proposals);
    }

    function displayKnowledge() {
        // fixme: port to svelte component if requirement arises
        let knhtml = "<table class='knowledgeTable'>";
        for (let p = 0; p < NPOS; ++p) {
            if (p === 0) {
                knhtml += "<tr>";
                for (let l = 0; l < NLETTER; ++l)
                    knhtml += "<th>" + globalCounts[l] + "</th>";
                knhtml += "</tr>";
            }
            knhtml += "<tr>";
            for (let l = 0; l < NLETTER; ++l) {
                knhtml += "<td>";
                const k = knowledge[p][l];
                if (k == Response.SURELY_NOT) {
                    knhtml += "<i style='color: red'>";
                } else if (k == Response.SURELY) {
                    knhtml += "<b style='color: green'>";
                }
                knhtml += String.fromCharCode(97 + l);
                if (k == Response.SURELY_NOT) {
                    knhtml += "</i>";
                } else if (k == Response.SURELY) {
                    knhtml += "</b>";
                }
                knhtml += "</td>";
            }
            knhtml += "</tr>";
        }
        knhtml += "</table>";
        knowledge_html = knhtml;
        knowledgeHtmlStore.set(knowledge_html);
    }


    //fixme: is not async in anything but name
    async function asyncUpdateStrategy() {
        updateAal();
    }

    // when responsehistory changes, take the last element and update_all()
    $: {
        // allow for updating if only one hand-written guess has been made so-far, as driver can only cope with one
        if ($responseHistoryStore.length > 0 && ($hideProposalsStore === false || responseHistoryStore.length < 2)) {
            // if last response is "00000", do not update strategy
            if (!$winTrigger || !$lossTrigger) {
                gameInProgress.set(true); //todo: use to disallow breaking changes
                asyncUpdateStrategy();
            }
        }
    }


</script>

<Snackbar bind:this={snackbarDriverInfo} timeoutMs="{4000}">
    <Label>{snackbarDriverInfoText}</Label>
</Snackbar>

<Snackbar bind:this={snackbarDriverError} class="error">
    <Label>{snackbarDriverErrorText}</Label>
</Snackbar>


<style>

</style>