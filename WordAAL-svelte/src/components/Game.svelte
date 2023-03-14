<script>
    import {NLETTER, NPOS, NWORDS, WORDS, convertStringToCharArray, arraysEqual} from "../lib/Consts.svelte";
    import StrategyDriver from "./StrategyDriver.svelte";
    import ResponseHistory from "./ResponseHistory.svelte";
    import {
        guessStore,
        responseStore,
        responseHistoryStore,
        targetWordStore,
        newGameTrigger,
    } from "../stores/stores.js";
    import {onMount} from "svelte";

    onMount(() => {
        console.log("onMount game");
    });

    // when response changes, append it to history stores
    $: if ($responseHistoryStore !== undefined && $responseStore !== undefined) {
        // check if first element is empty array
        if ($responseHistoryStore.length === 1 && $responseHistoryStore[0].length === 0) {
            // slice 1 to last element in array
            responseHistoryStore.set($responseHistoryStore.slice(1));
        }
        responseHistoryStore.set([...$responseHistoryStore, $responseStore]);
    } else {
        responseHistoryStore.set($responseStore);
    }

    export function resetGame() {
        console.warn("resetGame");
        guessStore.set("");
        responseStore.set([]);
        responseHistoryStore.set([]);
        newGameTrigger.set(true);
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

    export function handleGuessInput(event) {
        if (event.key !== "Enter") {
            return;
        }

        let guessCharArray = convertStringToCharArray($guessStore);

        if ($guessStore.length !== NPOS) {
            // if guess is not NPOS long, alert user
            alert("Guess must be 5 letters long!");
        } else if ($responseHistoryStore.length >= 5) {
            alert("No more guesses, you've lost!");
        } else if ($responseHistoryStore.some((x) => x[0] === $guessStore)) {
            // if guess is in history, alert user
            alert("You've already guessed that word!");
        } else {


            let inWordlist = false;
            for (let i = 0; i < NWORDS; i++) {
                if (arraysEqual(guessCharArray, WORDS[i])) {
                    inWordlist = true;
                    break;
                }
            }
            if (!inWordlist) {
                // if guess word is not in wordlist, alert user
                alert("That word is not in the wordlist!");
                return;
            }

            // get previous guess word as string
            for (let i = 0; i < $responseHistoryStore.length; i++) {
                // join response history element into string
                let w = "";
                $responseHistoryStore[i].forEach((x) => w += x[0]);
                if (w === $guessStore) {
                    // if guess is in history, alert user
                    alert("You've already guessed that word!")
                    return;
                }
            }
            // guess is legal, calc response and check for win condition
            wordleResponse();
            if ($responseHistoryStore.length >= 1 && $responseStore.every((x) => x[1] === 0)) {
                alert("You've won!");
                resetGame();
            }
        }
    }
</script>

<input type="text" bind:value={$guessStore} on:keypress={handleGuessInput} maxlength={NPOS} placeholder="guess">
<button on:click={handleGuessInput}>Guess</button>

<ResponseHistory response={$responseStore}/>
