<script lang="ts">
    import {
        NPOS,
        MAX_N_GUESSES,
        wordInWordlist,
        NLETTER
    } from "../lib/Consts.svelte";
    import ResponseHistory from "./ResponseHistory.svelte";
    import {
        guessStore,
        responseStore,
        responseHistoryStore,
        targetWordStore,
        guessSubmitTrigger,
        winTrigger,
        lossTrigger,
    } from "../stores/stores.js";

    import Snackbar, {Label} from '@smui/snackbar';
    import Dialog, {Title, Content, Actions, InitialFocus} from '@smui/dialog';
    import Button from '@smui/button';
    import {Fireworks} from 'fireworks-js'


    let fireworks;


    let gameEndDialogOpen = false;

    let snackbarSuccess: Snackbar;
    let snackbarWarning: Snackbar;
    let snackbarError: Snackbar;

    let successText: string = "DEFAULT SUCCESS TEXT";
    let warningText: string = "DEFAULT WARNING TEXT";
    let errorText: string = "DEFAULT ERROR TEXT";

/*        export function resetGame() {
            setTimeout(() => {
                conso;le.warn("resetting game");
                guessStore.set("");
                responseStore.set([]);
                responseHistoryStore.set([]);
                newGameTrigger.set(true);
                winTrigger.set(false);
                gameInProgress.set(false)
            }, 1000);
        }*/

    export function wordleResponse() {
        if ($targetWordStore['cleartext'] === undefined || $guessStore === undefined || $guessStore.length !== NPOS) {
            console.error("wordleResponse: targetWord or guess is undefined or guess is not NPOS long")
            return;
        }

        const correctLetters = $targetWordStore['cleartext'];
        console.log("correctLetters", correctLetters);
        let res = [['a', -1], ['a', -1], ['a', -1], ['a', -1], ['a', -1]];

        // occurrences of letters in guess in targetWord
        // make new map with all letters in alphabet as keys and 0 as values
        let occurrences = new Map();
        for (let i = 0; i < NLETTER; i++) {
            occurrences.set(String.fromCharCode(97 + i), 0);
        }

        // for each guess letter, check if it is in targetWord
        // if it is, count up occurrences of that letter in targetWord
        for (let i = 0; i < NPOS; i++) {
            if ($targetWordStore.cleartext.includes($guessStore[i])) {
                // set value to min of current value and number of occurrences of letter in targetWord
                occurrences.set($guessStore[i], Math.min(occurrences.get($guessStore[i]) + 1,
                    $targetWordStore.cleartext.split($guessStore[i]).length - 1));

            }
        }

        for (let i = 0; i < NPOS; i++) {
            if ($guessStore[i] === $targetWordStore['cleartext'][i]) {
                res[i] = [$guessStore[i], 0];
            } else if ($targetWordStore.cleartext.includes($guessStore[i]) && occurrences.get($guessStore[i]) > 0) {
                res[i] = [$guessStore[i], 1];
                // decrement occurrence of letter in guess when used
                occurrences.set($guessStore[i], occurrences.get($guessStore[i]) - 1);
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
                setTimeout(() => {
                    gameEndDialogOpen = true;
                }, 2000);
            } else if ($responseHistoryStore.length >= MAX_N_GUESSES) {
                lossTrigger.set(true);
                warningText = `You've lost! The word was ${$targetWordStore['cleartext'].toUpperCase()}`;
                snackbarWarning.open();
                $guessStore = $targetWordStore['cleartext'];
                setTimeout(() => {
                    gameEndDialogOpen = true;
                }, 2000);
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

    setTimeout(() => {
        const container = document.querySelector("#firework")
        fireworks = new Fireworks(container, {
            acceleration: 1.01,
            intensity: 50,
            opacity: 0.8,
        });
    }, 200);

    winTrigger.subscribe((win) => {
        if (win) {
            fireworks.launch(10);
            let interval = setInterval(() => {
                fireworks.launch(5);
            }, 500);
            setTimeout(() => {
                clearInterval(interval)
            }, 2000)
        }
    })


</script>


<ResponseHistory/>

<Snackbar bind:this={snackbarSuccess} class="success">
    <Label>{successText}</Label>
</Snackbar>

<Snackbar bind:this={snackbarWarning} class="warning">
    <Label>{warningText}</Label>
</Snackbar>

<Snackbar bind:this={snackbarError} class="error">
    <Label>{errorText}</Label>
</Snackbar>


<Dialog
        bind:open={gameEndDialogOpen}
        aria-labelledby="gameEndDialogTitle"
        aria-describedby="gameEndDialogContent"
>
    <Title id="gameEndDialogTitle">End of game</Title>
    <Content id="gameEndDialogContent">
        {#if $winTrigger}
            You have won! 🎉
        {:else if $lossTrigger}
            You have lost! ☹️
        {/if}
        <br/><br/>
        Start a new game or continue looking at current game?
    </Content>
    <Actions>
        <Button defaultAction
                use={[InitialFocus]}
                on:click={() => (location.reload())}>
            <Label>New game</Label>
        </Button>
        <Button>
            <Label>Dismiss</Label>
        </Button>
    </Actions>
</Dialog>
<style lang="scss">
  .box {
    display: flex;
    flex-direction: row;
    float: inside;
    padding: 5px;
    margin: 5px;
  }
</style>