<script>
    import {NLETTER, NPOS, NWORDS, WORDS} from "../lib/Consts.svelte";
    import Key from "./Key.svelte";
    import StrategyDriver from "./StrategyDriver.svelte";
    import ResponseHistory from "./ResponseHistory.svelte";
    import {guessStore, responseStore, responseHistoryStore, targetWordStore} from "../stores/stores.js";
    import {get} from "svelte/store";
    import {onMount} from "svelte";

    onMount(() => {
        console.log("onMount game");
        guessStore.set("aeiou");
    });


    // when response changes, append it to history stores
    $: if ($responseStore !== undefined) {
        responseHistoryStore.update((history) => {
            history.push($responseStore);
            return history;
        });
    }

    export function wordleResponse() {
        if ($targetWordStore['cleartext'] === undefined || $guessStore === undefined) {
            return;
        }
        const correctLetters = new Set($targetWordStore['cleartext']);
        let res = [['a', -1], ['a', -1], ['a', -1], ['a', -1], ['a', -1]];

        for (let i = 0; i < NPOS; i++) {
            if ($guessStore[i] === $targetWordStore['cleartext'][i]) {
                res[i] = [$guessStore[i], 0];
            } else if (correctLetters.has($guessStore[i])) {
                res[i] = [$guessStore[i], 1];
            } else {
                res[i] = [$guessStore[i], 2];
            }
        }
        responseStore.set(res);
    }

    /*
    Demo response:
{#each wordleResponse(target, guess) as k}
    <Key value={k[0].toUpperCase()} state={k[1]}/>
{/each}

     */
</script>

<button on:click={wordleResponse}>Submit</button>

<input bind:value={$guessStore} placeholder="guess">


<input bind:value={$responseStore} placeholder="response" contenteditable="false">

<StrategyDriver target={$targetWordStore['cleartext']} guess={$guessStore}/>
<ResponseHistory response={$responseStore}/>
