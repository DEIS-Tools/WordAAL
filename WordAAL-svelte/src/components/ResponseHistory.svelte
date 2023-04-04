<script>
    import {guessStore, guessSubmitTrigger, responseHistoryStore} from '../stores/stores.js';
    import Key from "./Key.svelte";
    import {fly} from "svelte/transition";


    const fiveSpaces = [];
    let prelimGuess = fiveSpaces;

    $:{
        // when keyboard event, replace a key in representation of guessStore, applying transition directive
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
    }


</script>
<div class="history">
    {#if ($responseHistoryStore !== undefined && $responseHistoryStore.length > 0)}
        {#if $responseHistoryStore[0].length > 0}
            {#each $responseHistoryStore as responseHistory, idxWord}
                <div class="historyEntry" in:fly={{x:-100, duration: 500}}>
                    &nbsp;  {idxWord + 1} &nbsp;
                    {#each responseHistory as guess, idxLetter}
                        <Key value={guess[0].toUpperCase()}
                             state={guess[1]}/>
                    {/each}
                </div>
            {/each}
        {/if}
    {/if}
    <div class="historyEntry">
        &nbsp; {$responseHistoryStore.length + 1} &nbsp;
        {#each prelimGuess as guess, idxLetter}
            <Key value={guess.toUpperCase()} state={2}/>
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