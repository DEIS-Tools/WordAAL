<script>
    import {
        guessStore,
        guessSubmitTrigger,
        responseHistoryStore,
        sureLettersStore,
        globalCountsStore,
        knowledgeStore,
    } from '../stores/stores.js';
    import Key from "./Key.svelte";
    import {fly} from "svelte/transition";
    import Response from "./StrategyDriver.svelte"
    import {NPOS, ASCII_OFFSET} from "../lib/Consts.svelte"

    const fiveSpaces = [];
    let prelimGuess = fiveSpaces;
    let knowledge = new Array(NPOS).fill(1);

    $:{
        // when keyboard event, replace a key in representation of guessStore
        if ($guessStore !== undefined && $guessStore.length >= 0) {
            prelimGuess = $guessStore;
            while (prelimGuess.length < 5) {
                prelimGuess += " ";
            }
        } else {
            if ($guessSubmitTrigger) {
                console.log("guessSubmitTrigger")
                prelimGuess = fiveSpaces;
            }
        }
        // reset and recalc prelim knowledge
        knowledge = new Array(NPOS).fill(2);
        colourPrelimGuess()
    }

    function colourPrelimGuess() {
        // check if undefined
        if ($knowledgeStore[0] === undefined) {
            return;
        }

        const correctLetters = $sureLettersStore.reduce(function (acc, curr) {
            return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, {});


        // convert prelim guess to 0-indexed character
        let guess = prelimGuess.trim().toLowerCase();

        for (let n = 0; n < guess.length; n++) {
            let char = guess.charCodeAt(n) - ASCII_OFFSET;

            // if counts for current letter is positive and is not known sure letter, mark knowledge as maybe
            if ($globalCountsStore[char] > (correctLetters[char] || 0)) {
                knowledge[n] = 1;
            }

            if ($sureLettersStore[n] === char) {
                knowledge[n] = 0;
            }
        }
    }

</script>
<div class="history">
    {#if ($responseHistoryStore !== undefined && $responseHistoryStore.length > 0)}
        {#if $responseHistoryStore[0].length > 0}
            {#each $responseHistoryStore as responseHistory, idxWord}
                <div class="historyEntry" in:fly={{x:-100, duration: 500}}>
                    <div style="align-items: center">
                        &nbsp;  {idxWord + 1} &nbsp;
                    </div>
                    {#each responseHistory as guess, idxLetter}
                        <Key value={guess[0].toUpperCase()}
                             state={guess[1]}/>
                    {/each}
                </div>
            {/each}
        {/if}
    {/if}
    <div class="historyEntry">
        <div style="align-items: center">
            &nbsp; {$responseHistoryStore.length + 1} &nbsp;
        </div>
        {#each prelimGuess as guess, idxLetter}
            <Key value={guess.toUpperCase()} state={knowledge[idxLetter]}/>
        {/each}
    </div>
</div>

<style>

    .history {
        display: flex;
        flex-direction: column;
        justify-content: left;
        align-items: center;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.81);
    }

    .historyEntry:hover {
        background-color: rgba(211, 211, 211, 0.81);
        border-radius: 6px;
    }

    .historyEntry {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
    }

</style>