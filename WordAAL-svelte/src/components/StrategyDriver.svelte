<script>

    import {NLETTER, NPOS, NWORDS, WORDS, convertStringToCharArray, convertCharArrayToString} from "../lib/Consts.svelte";
    import {guessStore, proposalsStore, responseHistoryStore, strategyStore} from "../stores/stores.js";
    import Button from "@smui/button";


    let strategyJSON = [];
    let strategy;
    let mode;
    let staticPath = "static/strategies/";

    let knowledge_html;

    const Response = {
        SURELY_NOT: -1,
        MAYBE: 0,
        SURELY: 1
    }

    // used for caching hardmode words
    let hard = new Array(NWORDS).fill(true);

    // counts of maximal number of occurences for each letter observed in a single word
    let global_counts = new Array(NLETTER).fill(0);

    // init: confident placement of letters
    let sure_letters = new Array(NPOS).fill(-1);

    // init: knowledge array
    let knowledge = new Array(NPOS);
    for (let i = 0; i < NPOS; ++i) {
        knowledge[i] = new Array(NLETTER).fill(0);
    }

    function parseStrategyConfigEvent(store) {
        mode = store['hard'];
        if (mode) {
            staticPath += store.s.location_hard;
        } else {
            staticPath += store.s.location;
        }

        loadStrategoStrategyJSON(staticPath);
        // reset path for reload of another strategy
        staticPath = "static/strategies/";

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

    function loadStrategoStrategyJSON(path) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', path, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4 && xobj.status === 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                strategyJSON = JSON.parse(xobj.responseText);
                console.log("driver: loaded strategy from " + path);
                show_words();
            }
        };
        xobj.send(null);
    }

    function update_count(guess, response) {
        // init zeroed local counts
        let local_counts = new Array(NLETTER).fill(0);

        // if response not absent at position, then increment local count
        for (let position = 0; position < NPOS; ++position)
            if (response[position] != 2) { //TYPE COERCION!!! response is a string, not a number
                local_counts[guess[position]] += 1;
            }

        // update global counts
        for (let letter = 0; letter < NLETTER; ++letter) {
            global_counts[letter] = Math.max(global_counts[letter], local_counts[letter]);
        }
    }

    function update_hints(guess, response) {
        // given a guess and response, update all sure letters
        for (let p = 0; p < NPOS; ++p)
            if (response[p] == 0) {
                sure_letters[p] = guess[p];
            }
    }

    function update_hard() {
        let local_counts = new Array(NLETTER);
        for (let w = 0; w < NWORDS; ++w) {
            if (hard[w]) { //fixme, simplify by only checking hard words?

                // copy global counts
                for (let letter = 0; letter < NLETTER; ++letter)
                    local_counts[letter] = global_counts[letter];

                // for each word position
                for (let p = 0; p < NPOS; ++p) {
                    // if we have a hint at this position for word w, and word w position is not the same as the hint
                    if (sure_letters[p] != -1 && WORDS[w][p] != sure_letters[p]) {
                        hard[w] = false; // we did not use the position-hints!
                    }
                    // todo, why??
                    --local_counts[WORDS[w][p]];
                }

                for (let l = 0; l < NLETTER; ++l) {
                    if (local_counts[l] > 0)
                        hard[w] = false; // we did not use all the hints!
                }
            }
        }
    }

    function update_conservative(response, guess) {
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
                if (global_counts[currGuessLetter] == 0) {
                    for (let q = 0; q < NPOS; ++q)
                        // mark this letter absent in all positions in knowledge
                        knowledge[q][currGuessLetter] = Response.SURELY_NOT;
                } else {
                    knowledge[pos][currGuessLetter] = Response.SURELY_NOT;
                    let all_ok = true;
                    for (let q = 0; q < NPOS; ++q) {
                        all_ok &= (guess[q] != currGuessLetter || response[q] !== 1);
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


    function check_sums() {
        let local_counts = new Array(NLETTER);
        for (let changed = true; changed; /*nothing*/ changed) {
            changed = false;
            for (let l = 0; l < NLETTER; ++l)
                local_counts[l] = global_counts[l];
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
                    --local_counts[letter];
                }
            }
            let sm = 0;
            for (let l = 0; l < NLETTER; ++l)
                sm += global_counts[l];
            if (sm == NPOS) {
                // we can remove all that are not consistent with the 5 known letters
                for (let p = 0; p < NPOS; ++p) {
                    for (let l = 0; l <= NLETTER; ++l) {
                        if (knowledge[p][l] != 1 && global_counts[l] == 0) {
                            knowledge[p][l] = -1;
                        }
                    }
                }
            }
        }
    }


    function update_permissive(response, guess) {
        update_conservative(response, guess);
        check_sums(response);
    }

    function word_id(guess) {
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
                    return "Uses invalid character '" + String.fromCharCode(97 + WORDS[wid][p]) + "' at position " + p + " (combined or conservative)";
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
                return "The word contains no new information (combined or permissive)";
            }
        }
        return null;
    }

    function update_all_e(e) {
        // if enter is pressed
        if (e.keyCode === 13) {
            e.preventDefault();
            update_all();
        }
    }

    function update_all() {

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
        let wid = word_id(num_guess);
        if (wid === null) {
            alert("Word is not in word-list '" + $guessStore + "'");
            return;
        }

        if (mode) {
            if (!hard[wid]) {
                alert("Word is not hard '" + $guessStore + "'");
                return;
            }
        }
        let has_error = consistent(wid);
        if (has_error !== null) {
            alert("Word is not consistent with game-mode. '" + $guessStore + "' " + has_error);
            return;
        }

        update_count(num_guess, response);
        update_hints(num_guess, response);

        if (mode) update_hard();
        if (strategy === 0) {
            update_conservative(response, num_guess);
        }
        if (strategy === 1 || strategy === 2) {
            update_permissive(response, num_guess);
        }
        display_knowledge();
        show_words();
    }

    function lookup(regressor) {
        if (typeof (regressor) === 'object') {
            let pv = strategyJSON["pointvars"][regressor["var"]].substring(5);
            let val = eval(pv); //fixme: jank lookup, might be similar to strategy_lookup fix
            let k = regressor["var"];
            if (val <= regressor["bound"])
                return lookup(regressor["low"]);
            else
                return lookup(regressor["high"]);
        } else {
            return regressor;
        }
    }

    function strategy_lookup(wid) {
        // fixme; jank method to create statevar string
        let sv = "(";
        if (strategyJSON["statevars"].length !== 0) {
            for (let i = 0; i < strategyJSON["statevars"].length; i++) {
                if (i !== 0) {
                    sv += ",";
                }
                sv += global_counts[i];
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

    function best_action() {
        if (strategyJSON === null) return Infinity;
        let mn = Infinity;
        for (let wid = 0; wid < NWORDS; ++wid) {
            if (consistent(wid) === null && (mode === 0 || hard[wid])) {
                mn = Math.min(mn, strategy_lookup(wid));
            }
        }
        return mn;
    }

    function show_words() {

        let best = best_action();
        let res = [];
        for (let wid = 0; wid < NWORDS; ++wid) {
            let word = {wid: wid, word: "", knowledge: [2, 2, 2, 2, 2], cost: Infinity};

            // if word is in any responseHistory, then skip
            for (let i = 0; i < $responseHistoryStore.length; i++) {
                let guess = $responseHistoryStore[i].map((x) => x[0]).join("");
                let num_guess = convertStringToCharArray(guess);
                if (word_id(num_guess) === wid) {
                    break;
                }
            }
            if (consistent(wid) === null && (mode === 0 || hard[wid])) {
                for (let p = 0; p < NPOS; ++p) {
                    let char = String.fromCharCode(97 + WORDS[wid][p]);

                    // if counts for current letter is positive and is not known sure letter, mark knowledge as 1
                    if (global_counts[WORDS[wid][p]] > 0) {
                        let already_correct = false;

                        for (let i = 0; i < NPOS; i++) {
                            if (sure_letters[i] != WORDS[wid][p]) {
                                already_correct = true;
                            }
                        }

                        if (already_correct) {
                            word["knowledge"][p] = 1;
                        }
                    }
                    // if sure about current letter being correct, mark it as 0
                    if (sure_letters[p] === WORDS[wid][p]) {
                        word["knowledge"][p] = 0;
                    }

                    word["word"] += char;
                }


                // if best action is not infinity, then we are in strategy mode??
                // Perhaps we have knowledge and are now able to query strategy to make a decision
                if (best !== Infinity) {
                    let cst = strategy_lookup(wid);
                    if (cst === undefined) { //if (cst === undefined) { previously
                        //alert("error at wid: " + wid + " with no cost from strat: " + cst);
                        continue;
                    }
                    word['cost'] = cst;
                }
                /*
                btn += "</button>";
                if (best === Infinity) {
                    proposals += btn;
                } else {
                    res.push({btn: btn, val: strategy_lookup(wid)})
                }*/

            }
            res.push(word);
        }

        if (best !== Infinity) {
            res.sort((a, b) => {
                return a.cost - b.cost;
            });

            //for (let o = 0; o < res.length; ++o)
            //    proposals += res[o].btn;
        }


        proposalsStore.set(res.sort((a, b) => {
            return a.cost - b.cost;
        }));
    }

    function display_knowledge() {
        // fixme: port to svelte component if requirement arises
        let knhtml = "<table class='knowledge'>";
        for (let p = 0; p < NPOS; ++p) {
            if (p === 0) {
                knhtml += "<tr>";
                for (let l = 0; l < NLETTER; ++l)
                    knhtml += "<th>" + global_counts[l] + "</th>";
                knhtml += "</tr>";
            }
            knhtml += "<tr>";
            for (let l = 0; l < NLETTER; ++l) {
                knhtml += "<td>";
                const k = knowledge[p][l];
                if (k == Response.SURELY_NOT) {
                    knhtml += "<i>";
                } else if (k == Response.SURELY) {
                    knhtml += "<b>";
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
    }

    // when responsehistory changes, take the last element and update_all()
    $: {
        if ($responseHistoryStore.length > 0) {
            update_all();
        }
    }


</script>

<!--<div class="driver">
    <Button variant="raised" on:click={update_all}>Query strategy</Button>
    <Button variant="raised" on:click={show_words}>Show words</Button>
</div>-->

<style>
    .driver {
        display: compact;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
</style>