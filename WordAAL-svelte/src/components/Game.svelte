<script>
    import {
        NPOS,
        MAX_N_GUESSES,
        wordInWordlist
    } from "../lib/Consts.svelte";
    import ResponseHistory from "./ResponseHistory.svelte";
    import {
        guessStore,
        responseStore,
        responseHistoryStore,
        targetWordStore,
        newGameTrigger,
        guessSubmitTrigger,
    } from "../stores/stores.js";

    import {onMount} from "svelte";
    import Textfield from "@smui/textfield";

    onMount(() => {
        console.log("onMount game");
        //guessStore.set("cedar");
    });


    export function resetGame() {
        console.warn("resetGame");
        guessStore.set("");
        responseStore.set([]);
        responseHistoryStore.set([]);
        newGameTrigger.set(true);
    }

    export function wordleResponse() {
        if ($targetWordStore['cleartext'] === undefined || $guessStore === undefined || $guessStore.length !== NPOS) {
            console.error("wordleResponse: targetWord or guess is undefined or guess is not NPOS long")
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

        // check legality of res
        if (res.length !== NPOS) {
            console.error("wordleResponse: res is not NPOS long");
            return;
        }

        responseStore.set(res);
        // reset guessStore
        guessStore.set("");

        // check that res is last element of responseStore
        if ($responseStore !== res) {
            console.error("wordleResponse: res is not last element of responseStore, got: " + $responseStore + " expected: " + res);
        }

        responseHistoryStore.update((x) => {
            // if default val, update in-place
            if (x.length === 1 && x[0].length === 0) {
                return [$responseStore];
            } else {
                return [...x, $responseStore];
            }
        })

    }

    export function handleGuessInput(event) {
        if (event.key === "Enter") {
            checkGuess();
        }
    }

    function guessInHistory(guess) {
        // given guess as string, check if it is in responseHistoryStore which has format [['a', 0], ['a', 0], ['a', 0], ['a', 0], ['a', 0]
        for (let i = 0; i < $responseHistoryStore.length; i++) {
            // make string from first element in array of responseHistoryStore
            if ($responseHistoryStore[i].map((x) => x[0]).join("") === guess) {
                return true;
            }
        }
        return false;
    }

    export function checkGuess() {
        if ($guessStore.length !== NPOS) {
            alert("Guess must be 5 letters long!");
        } else if (guessInHistory($guessStore)) {
            alert("You've already guessed that word!");
        } else if (!wordInWordlist($guessStore)) {
            alert("That word is not in the wordlist!");
        } else {
            // guess is legal, calc response and check for win condition
            wordleResponse();
            if ($responseHistoryStore.length >= 1 && $responseStore.every((x) => x[1] === 0)) {
                alert("You've won!");
                resetGame();
            } else if ($responseHistoryStore.length >= MAX_N_GUESSES) {
                alert("You've lost!");
                resetGame();
            }
        }
    }

    // if guessSubmitTrigger is set call checkGuess
    $: if ($guessSubmitTrigger) {
        guessSubmitTrigger.update((x) => {
            checkGuess();
            return !x;
        });
    }

</script>


<ResponseHistory/>
<Textfield class="guess" variant="outlined" bind:value={$guessStore} label="Guess" on:keypress={handleGuessInput}
           input$maxlength={NPOS} autofocus/>
