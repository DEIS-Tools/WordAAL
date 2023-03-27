<svelte:head>
    <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/svelte-material-ui@6.0.0/bare.min.css"
    />
</svelte:head>

<script>
    import Keyboard from "svelte-keyboard"
    import Key from './components/Key.svelte'
    import WordPicker from "./components/WordPicker.svelte";
    import StrategyDriver from "./components/StrategyDriver.svelte";
    import StrategyChooser from "./components/StrategyChooser.svelte";
    import {createEventDispatcher} from "svelte";
    import {guessStore, guessSubmitTrigger, targetWordStore} from "./stores/stores"
    import ProposalChooser from "./components/ProposalChooser.svelte";
    import Game from "./components/Game.svelte";

    const dispatch = createEventDispatcher();

    const onWordleKeyDown = (event) => {
        // backspace: remove the last character
        if (event.detail === "Backspace") {
            guessStore.update((guess) => {
                return guess.slice(0, -1);
            });
            return;
        }

        // enter: check guess
        if (event.detail === "Enter") {
            guessSubmitTrigger.set(true);
            return;
        }

        // only allow 5 characters
        if ($guessStore.length >= 5) {
            return;
        }

        guessStore.update((guess) => {
            // fixme: irrelevant guard (perhaps)
            if (guess.length <= 4 && event.detail !== "backspace" && event.detail !== "enter") {
                return guess + event.detail;
            } else {
                return guess;
            }
        });

    }

    /*    $: {
            console.log("guessStore", $guessStore);
            console.log("responseStore", $responseStore);
            console.log("responseHistoryStore", $responseHistoryStore);
            console.log("targetWordStore", $targetWordStore);
            console.log("newGameTrigger", $newGameTrigger);
        }*/

    let wordaalLogo = [
        {value: "W", state: 0},
        {value: "o", state: 1},
        {value: "r", state: 2},
        {value: "d", state: 1},
        {value: "A", state: 0},
        {value: "A", state: 0},
        {value: "L", state: 2},
    ]

    // todo: unused, make all communication through stores
    function handleStrategyConfig(event) {
        console.log(event.detail)
        dispatch('strategyConfigEvent', event.detail)
    }

</script>

<main>
    <div>
        {#each wordaalLogo as k}
            <Key {...k} clickable="true"/>
        {/each}
        <br/>
        <i>UPPAAL Stratego playing Wordle</i>
    </div>

    <div class="wrapper">
        <div class="left">
            <Game target="{$targetWordStore}"/>


        </div>
        <div class="right">
            <StrategyDriver/>

            <ProposalChooser/>

        </div>
    </div>


    <div>
        <Keyboard layout="wordle" on:keydown={onWordleKeyDown}/>
    </div>

    <div class="settings">
        <div class="wrapper">
            <div class="left">
                <WordPicker/>
            </div>
            <div class="right">
                <StrategyChooser on:strategyConfigEvent={handleStrategyConfig}/>
            </div>
        </div>

    </div>

</main>

<style>
    .wrapper {
        display: flex;

        border: 1px solid grey;
        border-radius: 10px;
        padding: 32px 16px;
        overflow: hidden; /* will contain if #first is longer than #second */
    }

    .left {
        flex-grow: 2;
        padding: 5px;
    }

    .right {
        flex-grow: 1;
        padding: 5px;
        overflow: hidden; /* if you don't want #second to wrap below #first */
    }
</style>
