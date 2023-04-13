<script lang="ts">
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
        winTrigger,
        gameInProgress,
    } from "../stores/stores.js";

    import Snackbar, {Label} from '@smui/snackbar';

    let snackbarSuccess: Snackbar;
    let snackbarWarning: Snackbar;
    let snackbarError: Snackbar;

    let successText: string = "DEFAULT SUCCESS TEXT";
    let warningText: string = "DEFAULT WARNING TEXT";
    let errorText: string = "DEFAULT ERROR TEXT";

    export function resetGame() {
        console.warn("resetGame");
        guessStore.set("");
        responseStore.set([]);
        responseHistoryStore.set([]);
        newGameTrigger.set(true);
        winTrigger.set(false);
        gameInProgress.set(false);
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
            errorText = "Guess must be 5 letters long!";
            snackbarError.open();
            setTimeout(() => {
                guessStore.set("");
            }, 2000);
        } else if (guessInHistory($guessStore)) {
            errorText = `You've already guessed the word '${$guessStore.toUpperCase()}'!`;
            snackbarError.open();
            setTimeout(() => {
                guessStore.set("");
            }, 2000);
        } else if (!wordInWordlist($guessStore)) {
            errorText = `Guess '${$guessStore.toUpperCase()}' is not in the wordlist !`;
            snackbarError.open();
            setTimeout(() => {
                guessStore.set("");
            }, 2000);
        } else {
            // guess is legal, calc response and check for win condition
            wordleResponse();
            if ($responseHistoryStore.length >= 1 && $responseStore.every((x) => x[1] === 0)) {
                winTrigger.set(true);
                successText = `You've won in ${$responseHistoryStore.length} guesses!`;
                snackbarSuccess.open();
/*                setTimeout(() => {
                    resetGame();
                }, 10000);*/
            } else if ($responseHistoryStore.length >= MAX_N_GUESSES) {
                warningText = `You've lost! The word was ${$targetWordStore['cleartext'].toUpperCase()}`;
                snackbarWarning.open();
                $guessStore = $targetWordStore['cleartext'];
                //todo; make modal which shows word and has button to start new game, also show prefilled target word distinct and in green
/*                setTimeout(() => {
                    resetGame();
                }, 10000);*/
            }
        }
    }

    // if guessSubmitTrigger is set call checkGuess
    $: if ($guessSubmitTrigger) {
        guessSubmitTrigger.update((x) => {
            checkGuess();
            setTimeout(() => {
            }, 100);
            return !x;
        });
    }


</script>


<ResponseHistory/>
<!--<Textfield class="guess" variant="outlined" bind:value={$guessStore} label="Guess" on:keypress={handleGuessInput}
           input$maxlength={NPOS} autofocus/>-->

<Snackbar bind:this={snackbarSuccess} class="success">
    <Label>{successText}</Label>
</Snackbar>

<Snackbar bind:this={snackbarWarning} class="warning">
    <Label>{warningText}</Label>
</Snackbar>

<Snackbar bind:this={snackbarError} class="error">
    <Label>{errorText}</Label>
</Snackbar>
<!-- DEBUG opening of snackbars
<Button on:click={() => snackbarSuccess && snackbarSuccess.open()}>
    <Label>Success</Label>
</Button>

<Button on:click={() => snackbarWarning && snackbarWarning.open()}>
    <Label>Warning</Label>
</Button>

<Button on:click={() => snackbarError && snackbarError.open()}>
    <Label>Error</Label>
</Button>-->

<style lang="scss">
  .box {
    display: flex;
    flex-direction: row;
    float: inside;
    padding: 5px;
    margin: 5px;
  }
</style>