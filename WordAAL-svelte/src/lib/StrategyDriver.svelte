<script>

    /*
    update:
    - given guess and response
        - check guess is legal (5 char, only letters, in wordlist, check is a hard word)
     */

    import {NLETTER, NPOS, NWORDS, WORDS} from "./Consts.svelte";
    import {proposalsStore, responseHistoryStore, strategyStore} from "./stores.js";


    let strategiesFilenames = [
        {name: "conservative-pt", location: "CONS_PT.json"},
        {name: "conservative-hardmode-pt", location: "CONS_HM_PT.json"},
        {name: "combined-pt", location: "COMB_PT.json"},
        {name: "combined-hardmode-pt", location: "COMB_HM_PT.json"},
        {name: "permissive-hardmode-pt", location: "PERM_HM_PT.json"},
    ];

    let strategoPath;
    let stratego_strategy = [];
    let strategy;
    let mode;

    function parseStrategyConfigEvent(store) {
        let s_idx = store['idx'];
        mode = store['hard'];
        // load json strategy from strategiesFilenames based on strategy and mode
        if (s_idx === undefined) {
        } else {
            // cons
            if (s_idx === 0) {
                if (!mode) {
                    strategoPath = strategiesFilenames[0];
                } else {
                    strategoPath = strategiesFilenames[1];
                }
                //comb
            } else if (s_idx === 1) {
                // set strategy for legacy
                strategy = 2;
                if (!mode) {
                    strategoPath = strategiesFilenames[2];
                } else {
                    strategoPath = strategiesFilenames[3];
                }
                //comb, no mode
            } else if (s_idx === 2) {
                strategy = 1;
                strategoPath = strategiesFilenames[4];
            }
        }
        return strategoPath;
    }

    $: {
        console.log("strategyStore changed, parsing");
        parseStrategyConfigEvent($strategyStore);
    }

    function loadStrategoStrategyJSON(path) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4 && xobj.status === 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                stratego_strategy = JSON.parse(xobj.responseText);
                console.log("fs loaded " + stratego_strategy);
            }
        };
        xobj.send(null);
    }

    $: {
        console.log("strategoPath changed, loading strategy json");
        if (strategoPath !== undefined) {
            console.log("loading strategy " + strategoPath['location'])
            loadStrategoStrategyJSON("static/strategies/" + strategoPath['location']);
        } else {
            console.log("no strategy selected, skipping");
        }
    }


    export let guess = "guess";
    export let response = "21200";


    // handle mode and strategy from strategyConfigEvent
    /* 0 = conservative
       1 = permissive
       2 = combined
     */


    let knowledge_html;

    let hard = new Array(NWORDS); // used for caching hardmode words
    let knowledge = new Array(NPOS);
    let counts = new Array(NLETTER);
    let sure_hints = new Array(NPOS);
    for (let i = 0; i < NPOS; ++i) {
        knowledge[i] = new Array(NLETTER);
        sure_hints[i] = -1;
        for (let l = 0; l < NLETTER; ++l)
            knowledge[i][l] = 0;
    }
    for (let l = 0; l < NLETTER; ++l) {
        counts[l] = 0;
    }

    for (let w = 0; w < NWORDS; ++w) {
        hard[w] = true;
    }


    function update_count(guess, response) {
        // response: 0=in-place, 1=present, 2=absent
        let local_counts = new Array(NLETTER);
        for (let i = 0; i < NLETTER; ++i)
            local_counts[i] = 0;
        for (let p = 0; p < NPOS; ++p)
            if (response[p] !== 2)
                local_counts[guess[p]] += 1;
        for (let c = 0; c < NLETTER; ++c)
            counts[c] = Math.max(counts[c], local_counts[c]);
    }

    function update_hints(guess, response) {
        for (let p = 0; p < NPOS; ++p)
            if (response[p] === 0)
                sure_hints[p] = guess[p];
    }

    function update_hard() {
        let local_counts = new Array(NLETTER);
        for (let w = 0; w < NWORDS; ++w) {
            if (hard[w]) {
                for (let l = 0; l < NLETTER; ++l)
                    local_counts[l] = counts[l];
                for (let p = 0; p < NPOS; ++p) {
                    if (sure_hints[p] !== -1 && WORDS[w][p] !== sure_hints[p])
                        hard[w] = false; // we did not use the position-hints!
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
        for (let p = 0; p < NPOS; ++p) {
            if (response[p] === 0) {
                for (let l = 0; l < NLETTER; ++l)
                    knowledge[p][l] = -1;
                knowledge[p][guess[p]] = 1;
            } else if (response[p] === 1) { // incorrectly placed
                knowledge[p][guess[p]] = -1;
            } else if (response[p] === 2) {
                if (counts[guess[p]] === 0) { // does not appear at all
                    for (let q = 0; q < NPOS; ++q)
                        knowledge[q][guess[p]] = -1;
                } else {
                    knowledge[p][guess[p]] = -1;
                    let all_ok = true;
                    for (let q = 0; q < NPOS; ++q) {
                        all_ok &= (guess[q] !== guess[p] || response[q] !== 1);
                        if (!all_ok) break;
                    }
                    if (all_ok) {
                        // all are correctly placed
                        for (let q = 0; q < NPOS; ++q)
                            if (guess[q] !== guess[p] || response[q] !== 0)
                                knowledge[q][guess[p]] = -1;
                    }
                }
            }
        }
    }


    function check_sums(response) {
        let local_counts = new Array(NLETTER);
        for (let changed = true; changed; /*nothing*/ changed) {
            console.log("check_sum");
            changed = false;
            for (let l = 0; l < NLETTER; ++l)
                local_counts[l] = counts[l];
            // check if there is only one unknown letter left
            for (let p = 0; p < NPOS; ++p) {
                let letter_sum = 0;
                let letter = 0;
                for (let l = 0; l < NLETTER; ++l) {
                    if (knowledge[p][l] !== -1) {
                        letter = l;
                        letter_sum += 1;
                    }
                }
                if (letter_sum === 1 && knowledge[p][letter] !== 1) { // new information!

                    knowledge[p][letter] = 1;
                    changed = true;
                    console.log("Got " + p + " " + letter);
                }
                if (letter_sum === 1) {
                    --local_counts[letter];
                }
            }
            let sm = 0;
            for (let l = 0; l < NLETTER; ++l)
                sm += counts[l];
            if (sm === NPOS) {
                // we can remove all that are not consistent with the 5 known letters
                for (let p = 0; p < NPOS; ++p) {
                    for (let l = 0; l <= NLETTER; ++l) {
                        if (knowledge[p][l] !== 1 && counts[l] === 0) {
                            console.log("Got2 " + p); //console.log("Got2 " + p + " " + letter);
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

    // let mode = 0;
    // let strategy = 0;

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
        if (strategy === 0 || strategy === 2) {
            for (let p = 0; p < NPOS; ++p) {
                if (knowledge[p][WORDS[wid][p]] === -1) {
                    return "Uses invalid character '" + String.fromCharCode(97 + WORDS[wid][p]) + "' at position " + p + " (combined or conservative)";
                }
            }
        }
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
        // let guess = document.getElementById("guess").value;
        // let response = document.getElementById("response").value;

        if (response.length !== NPOS) {
            alert("Need 5 characters in reponse");
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
            alert("Word is not in word-list '" + guess + "'");
            return;
        }

        if (mode) {
            if (!hard[wid]) {
                alert("Word is not hard '" + guess + "'");
                return;
            }
        }
        let has_error = consistent(wid);
        if (has_error !== null) {
            alert("Word is not consistent with game-mode. '" + guess + "' " + has_error);
            return;
        }


        let history = $responseHistoryStore;
        // not needed if ResponseHistory component manages its own state
        //history.innerHTML = response_to_html(guess, response) + history.innerHTML;

        console.log(num_guess);
        update_count(num_guess, response);
        update_hints(num_guess, response);
        if (mode) update_hard();
        if (strategy === 0) {
            update_conservative(response, num_guess);
        }
        if (strategy == 1 || strategy == 2) {
            update_permissive(response, num_guess);
        }
        display_knowledge();
        show_words();
    }

    function lookup(regressor) {
        if (typeof (regressor) === 'object') {
            let pv = stratego_strategy["pointvars"][regressor["var"]].substring(5);
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
        let sv = "(";
        let first = true;
        if (stratego_strategy["statevars"].length !== 0) {
            let v = stratego_strategy["statevars"][0]; //wack
            for (v in stratego_strategy["statevars"]) {
                if (!first) sv += ",";
                first = false;
                let field = stratego_strategy["statevars"][v].substring(5);
                sv += eval(field);
            }
            sv += ")";
        } else {
            sv = "(1)";
        }
        console.log(stratego_strategy["regressors"]);
        let r = stratego_strategy["regressors"][sv]["regressor"][String(wid)];
        return lookup(r);
    }

    function best_action() {
        if (stratego_strategy === null) return Infinity;
        let mn = Infinity;
        for (let wid = 0; wid < NWORDS; ++wid) {
            if (consistent(wid) === null && (mode == 0 || hard[wid])) {
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
            if (consistent(wid) === null && (mode === 0 || hard[wid])) {
                {
                    let vw = "";
                    if (wid < 2315) vw += "<b>"; // bold if in wordlist
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
                    if (wid < 2315) vw += "</b>";
                    //let btn = "<button class='word' onclick='fill_answer(\"" + word + "\")'>" + vw;


                    // if best action is not infinity, then we are in strategy mode??
                    if (best !== Infinity) {
                        let cst = strategy_lookup(wid);
                        if (cst === undefined) { //if (cst === undefined) { previously
                            //alert("error at wid: " + wid + " with no cost from strat: " + cst);
                            continue;
                        }
                        console.log("wid: " + wid, " cst: " + cst)
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
            }
            res.push(word);
        }
        /*
        if (best !== Infinity) {
            res.sort((a, b) => {
                return a.cost - b.cost;
            });

            //for (let o = 0; o < res.length; ++o)
            //    proposals += res[o].btn;
        }

         */

        proposalsStore.set(res);
    }

    function fill_answer(word) {
        document.getElementById("guess").value = word;
        if (word)
            play(word); // do wordle game logic
    }

    function display_knowledge() {
        let knhtml = "";
        for (let p = 0; p < NPOS; ++p) {
            if (p != 0) knhtml += "<br/>";
            if (p == 0) {
                for (let l = 0; l < NLETTER; ++l)
                    knhtml += "<span class='yellow'>" + counts[l] + "</span>";
                knhtml += "<br/>";
            }
            for (let l = 0; l < NLETTER; ++l) {
                const k = knowledge[p][l];
                knhtml += "<span class='";
                if (k == -1) {
                    knhtml += "gray";
                } else if (k == 1) {
                    knhtml += "green";
                } else {
                    knhtml += "white";
                }
                knhtml += "'>" + String.fromCharCode(97 + l) + "</span>";
            }
        }
        knowledge_html = knhtml;
    }


    // game logic
    function play(g) {
        // calculate response for word onto TARGET_WORD
        if (g === undefined) {
            alert("Pick word to guess before choosing a word");
            return;
        }
        const guess = g.split('');
        const target = document.getElementById('target_word').value.split('');

        const correctLetters = new Set(TARGET['cleartext']);
        let response = [-1, -1, -1, -1, -1];

        for (let i = 0; i < NPOS; i++) {
            if (guess[i] === target[i]) {
                response[i] = 0;
            } else if (correctLetters.has(guess[i])) {
                response[i] = 1;
            } else {
                response[i] = 2;
            }
        }
        console.log("guess: " + g + " gave response: " + response);

        document.getElementById("response").value = response.join('');
        update_all();
    }


</script>

<div class="driver">
    <input bind:value={guess} placeholder="guess">
    <input bind:value={response} placeholder="response">
    <button on:click={update_all}>Guess</button>
</div>

<style>
    .driver {
        display: compact;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
</style>