<script>
    import {
        guessStore,
        guessSubmitTrigger,
        responseHistoryStore,
        sureLettersStore,
        globalCountsStore,
        knowledgeStore,
        winTrigger, lossTrigger,
        targetWordStore,
    } from '../stores/stores.js';
    import Key from "./Key.svelte";
    import {fly} from "svelte/transition";
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
        knowledge = new Array(NPOS).fill(3);
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
                <!--add class 'winning' if historyEntry is winning word-->
                <div class="historyEntry" class:winning="{$winTrigger && idxWord === $responseHistoryStore.length - 1}"
                     in:fly={{x:-100, duration: 500}}>
                    <div style="align-items: center">
                        &nbsp;  {idxWord + 1} &nbsp;
                    </div>
                    {#each responseHistory as guess, idxLetter}
                        <Key value={guess[0].toUpperCase()}
                             state={guess[1]}/>
                    {/each}
                </div>
            {/each}
            {#if $lossTrigger}
                <div class="historyEntry losing"
                     in:fly={{x:-100, duration: 500}}>
                    <div style="align-items: center">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <!--fixme; better inset and with css instead-->
                    </div>
                    {#each $targetWordStore.cleartext as guess}
                        <Key value={guess.toUpperCase()}
                             state={0}/>
                    {/each}
                </div>
            {/if}
        {/if}
    {/if}
    {#if !$winTrigger && !$lossTrigger}
        <div class="historyEntry">
            <div style="align-items: center">
                &nbsp; {$responseHistoryStore.length + 1} &nbsp;
            </div>
            {#each prelimGuess as guess, idxLetter}
                <Key value={guess.toUpperCase()} state={knowledge[idxLetter]}/>
            {/each}
        </div>
    {/if}
</div>

<style>
    .history {
        display: flex;
        flex-direction: column;
        justify-content: left;
        align-items: center;
        border-radius: 5px;
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

    .winning {
        /*make winning entry look like a gold sticker in its background */
        background-color: rgba(255, 215, 0, 0.81);
        border: gold 2px solid;
        border-radius: 6px;
    }

    .losing {
        /*make losing entry look like a red sticker in its background */
        background-color: rgba(255, 0, 0, 0.40);
        border: red 2px solid;
        border-radius: 6px;
    }

</style>