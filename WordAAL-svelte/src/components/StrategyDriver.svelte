<script>

    import {NLETTER, NPOS, NWORDS, WORDS, convertCharArrayToString} from "../lib/Consts.svelte";
    import {guessStore, proposalsStore, responseHistoryStore, strategyStore} from "../stores/stores.js";
    import Button from "@smui/button";


    let strategyJSON = [];
    let strategy;
    let mode;
    let staticPath = "static/strategies/";

    let knowledge_html;

    let hard = new Array(NWORDS); // used for caching hardmode words

    const Response = {
        SURELY_NOT: -1,
        MAYBE: 0,
        SURELY: 1
    }

    let knowledge = new Array(NPOS);
    // counts of maximal number of occurences for each letter observed in a single word
    let global_counts = new Array(NLETTER);

    // init: confident placement of letters
    let sure_letters = new Array(NPOS);

    // init: knowledge array
    for (let i = 0; i < NPOS; ++i) {
        knowledge[i] = new Array(NLETTER);
        sure_letters[i] = -1;
        for (let l = 0; l < NLETTER; ++l)
            knowledge[i][l] = 0;
    }
    for (let l = 0; l < NLETTER; ++l) {
        global_counts[l] = 0;
    }

    for (let w = 0; w < NWORDS; ++w) {
        hard[w] = true;
    }

    function parseStrategyConfigEvent(store) {
        mode = store['hard'];
        console.log("driver: mode is " + mode);
        if (mode) {
            staticPath += store.s.location_hard;
        } else {
            staticPath += store.s.location;
        }

        loadStrategoStrategyJSON(staticPath);
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
        // 0 default, -1 surely not, 1 surely
        console.error(guess, response);
        // response: 0=in-place, 1=present, 2=absent
        let local_counts = new Array(NLETTER);
        // init local counts
        for (let letter_local = 0; letter_local < NLETTER; ++letter_local) //fixme, unneeded - but remove after it works, dummy
            local_counts[letter_local] = 0;

        // if response says not absent at position, then increment local count
        for (let position = 0; position < NPOS; ++position)
            if (response[position] != 2) { //fixme: TYPE COERCION!!! problem is that response is a string, not a number
                local_counts[guess[position]] += 1;
            }


        // update global counts
        for (let letter = 0; letter < NLETTER; ++letter)
            global_counts[letter] = Math.max(global_counts[letter], local_counts[letter]);
    }

    function update_hints(guess, response) {
        // given a guess and response, update all sure letters
        for (let p = 0; p < NPOS; ++p)
            if (response[p] === 0)
                sure_letters[p] = guess[p];
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
                    // if we have a hint at this position for word w and word w position is not the same as the hint
                    if (sure_letters[p] !== -1 && WORDS[w][p] !== sure_letters[p]) {
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
            if (response[pos] === 0) { // letter p in guess is correctly placed
                // set all letters to SURELY-NOT in this position
                for (let l = 0; l < NLETTER; ++l)
                    knowledge[pos][l] = Response.SURELY_NOT;
                // mark the guess-letter as SURELY present in this position
                knowledge[pos][currGuessLetter] = Response.SURELY;

            } else if (response[pos] === 1) { // incorrectly placed
                // mark this letter SURELY-NOT in this position in this position
                knowledge[pos][currGuessLetter] = Response.SURELY_NOT;

            } else if (response[pos] === 2) { // does not appear at all
                if (global_counts[currGuessLetter] === 0) {
                    for (let q = 0; q < NPOS; ++q)
                        // mark this letter absent in all positions in knowledge
                        knowledge[q][currGuessLetter] = Response.SURELY_NOT;
                } else {
                    knowledge[pos][currGuessLetter] = Response.SURELY_NOT;
                    let all_ok = true;
                    for (let q = 0; q < NPOS; ++q) {
                        all_ok &= (guess[q] !== currGuessLetter || response[q] !== 1);
                        if (!all_ok) break;
                    }
                    if (all_ok) {
                        // all are correctly placed i.e not MAYBE
                        for (let q = 0; q < NPOS; ++q)
                            if (guess[q] !== currGuessLetter || response[q] !== 0)
                                knowledge[q][currGuessLetter] = -1;
                    }
                }
            }
        }
    }


    function check_sums(response) { //fixme; arg not used?
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
                    console.log("Got " + p + " " + letter);
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

                            //console.log("Got2 " + p); //console.log("Got2 " + p + " " + letter);
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
            alert("No response history");
            return;
        }
        let last = $responseHistoryStore[$responseHistoryStore.length - 1];
        let guess = last.map((x) => x[0]).join("");
        let response = last.map((x) => x[1]).join("");
        console.log("update all, guess=" + guess + " response=" + response);

        if (response.length !== NPOS) {
            console.log(response)
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
        console.error("global_counts: " + global_counts); //fixme: debug
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
            let val = eval(pv);
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
        /*
        (1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0) legacy
        (1,0,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0) new
         */

        let cost;
        if (strategyJSON["regressors"][sv] === undefined) {
            cost = Infinity;
        } else {
            cost = lookup(strategyJSON["regressors"][sv]["regressor"][String(wid)]);
        }
        //console.warn("strategy_lookup:wid: " + wid + " (" + convertCharArrayToString(WORDS[wid]) + ") with cost: " + cost);
        return cost;
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
        let proposals = "";

        let best = best_action();
        let res = [];
        for (let wid = 0; wid < NWORDS; ++wid) {
            let word = {wid: wid, word: "", knowledge: [], cost: Infinity};

            // if word is in any responseHistory, then skip
            for (let i = 0; i < $responseHistoryStore.length; i++) {
                let guess = $responseHistoryStore[i].map((x) => x[0]).join("");
                let num_guess = new Array(NPOS);
                for (let p = 0; p < NPOS; ++p) {
                    num_guess[p] = guess.charCodeAt(p) - 97;
                }
                let wid2 = word_id(num_guess);
                if (wid2 === wid) {
                    break;
                }
            }
            if (consistent(wid) === null && (mode === 0 || hard[wid])) {
                let vw = "";

                let bold = (wid < 2315);


                for (let p = 0; p < NPOS; ++p) {
                    let char = String.fromCharCode(97 + WORDS[wid][p]);

                    let color = "white";
                    if (knowledge[p][WORDS[wid][p]] === -1)
                        color = "gray";
                    else if (knowledge[p][WORDS[wid][p]] === 1)
                        color = "green";
                    // push status
                    word["knowledge"].push(knowledge[p][WORDS[wid][p]])
                    word["word"] += char;
                    //vw += "<span class=" + color + ">" + char + "</span>";
                    //word += char
                }
                //let btn = "<button class='word' onclick='fill_answer(\"" + word + "\")'>" + vw;


                // if best action is not infinity, then we are in strategy mode??
                // Perhaps we have knowledge and are now able to query strategy to make a decision
                if (best !== Infinity) {
                    let cst = strategy_lookup(wid);
                    if (cst === undefined) { //if (cst === undefined) { previously
                        //alert("error at wid: " + wid + " with no cost from strat: " + cst);
                        continue;
                    }
                    //console.log("wid: " + wid, " cst: " + cst)
                    word['cost'] = cst;
                    //btn += "(" + cst.toFixed(3) + ")";
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

    //fixme: port knowledge to svelte component
    function display_knowledge() {
        let knhtml = "";
        for (let p = 0; p < NPOS; ++p) {
            if (p !== 0) knhtml += "<br/>";
            if (p === 0) {
                for (let l = 0; l < NLETTER; ++l)
                    knhtml += "<span class='yellow'>" + global_counts[l] + "</span>";
                knhtml += "<br/>";
            }
            for (let l = 0; l < NLETTER; ++l) {
                const k = knowledge[p][l];
                knhtml += "<span class='";
                if (k === -1) {
                    knhtml += "gray";
                } else if (k === 1) {
                    knhtml += "green";
                } else {
                    knhtml += "white";
                }
                knhtml += "'>" + String.fromCharCode(97 + l) + "</span>";
            }
        }
        knowledge_html = knhtml;
    }

    // generate history of guesses and their accuracy per letter in guess
    // todo: refactor to message Response History
    function response_to_html(guess, response) {
        let res = "";
        for (let p = 0; p < NPOS; ++p) {
            if (response[p] === 2) {
                res += "<span class='gray'>" + String(guess[p]) + "</span>"
            } else if (response[p] === 1) {
                res += "<span class='yellow'>" + String(guess[p]) + "</span>"
            } else {
                res += "<span class='green'>" + String(guess[p]) + "</span>"
            }
        }
        return "<div class=element >" + res + "</div>";
    }

    // when responsehistory changes, take the last element and update_all()
    $: {
        if ($responseHistoryStore.length > 0) {
            console.log("responseHistoryStore changed: " + $responseHistoryStore[$responseHistoryStore.length - 1]);
            update_all();
        }
    }

    $: {
        // when knowledge matrix changes, update the knowledge html
        display_knowledge();
    }


</script>

<div class="driver">
    <Button variant="raised" on:click={update_all}>Query strategy</Button>
    <Button variant="raised" on:click={show_words}>Show words</Button>

    <div class="knowledge">
        {@html knowledge_html}
    </div>
</div>

<style>
    .driver {
        display: compact;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    #knowledge {
        position: absolute;
        bottom: 0px;
        width: 884px;
        margin-left: -442px;
        left: 50%;
    }

    .green, .yellow, .gray, .white {
        height: 30px;
        width: 30px;
        border-radius: 3px;
        display: inline-block;
        text-align: center;
        vertical-align: middle;
        border: 1px solid black;
        margin-right: 2px;
    }

    .green {
        background-color: green;
    }

    .yellow {
        background-color: yellow;
    }

    .gray {
        background-color: grey;
    }
</style>