<script>
    import Keyboard from "svelte-keyboard"
    import Key from './lib/Key.svelte'
    import WordPicker from "./lib/WordPicker.svelte";
    import StrategyDriver from "./lib/StrategyDriver.svelte";
    import StrategyChooser from "./lib/StrategyChooser.svelte";
    import {createEventDispatcher} from "svelte";
    import {initRandomResponseHistoryStore, responseHistoryStore} from "./lib/stores.js";
    import ResponseHistory from "./lib/ResponseHistory.svelte";
    import ProposalChooser from "./lib/ProposalChooser.svelte";
    import Game from "./lib/Game.svelte";

    const dispatch = createEventDispatcher();

    const onKeydown = (event) => {
        console.log(event.detail);
    }

    // declare logo
    let wordaalLogo = [
        {value: "W", state: 0},
        {value: "o", state: 1},
        {value: "r", state: 2},
        {value: "d", state: 1},
        {value: "A", state: 0},
        {value: "A", state: 0},
        {value: "L", state: 2},
    ]

    function handleStrategyConfig(event) {
        console.log(event.detail)
        dispatch('strategyConfigEvent', event.detail)
    }

    initRandomResponseHistoryStore()
    console.log($responseHistoryStore)
</script>

<main>
    <div class="card">
        {#each wordaalLogo as k}
            <Key {...k}/>
        {/each}
        <br/>
        <i>UPPAAL Stratego playing Wordle</i>
    </div>

    <div class="wrapper">
        <div class="left">
            <WordPicker/>
            <StrategyChooser on:strategyConfigEvent={handleStrategyConfig}/>
        </div>
        <div class="right">
            <StrategyDriver on:strategyConfigEvent/>


        </div>
        <ResponseHistory/>
        <ProposalChooser/>
    </div>

    <Game/>


    <div class="card">
        <Keyboard layout="wordle" on:keydown={onKeydown}/>
    </div>

</main>

<style>
    .wrapper {
        width: 1000px;
        border: 1px solid black;
        border-radius: 10px;
        padding: 5px;
        overflow: hidden; /* will contain if #first is longer than #second */
    }

    .left {
        width: 550px;
        float: left; /* add this */
        border-radius: 10px;
    }

    .right {
        border-radius: 10px;
        overflow: hidden; /* if you don't want #second to wrap below #first */
    }

    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }

    .read-the-docs {
        color: #888;
    }
</style>
