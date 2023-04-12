<svelte:head>
    <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
    />
    <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700"
    />
    <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto+Mono"
    />
    <link rel="stylesheet" href="node_modules/svelte-material-ui/bare.css"/>
    <!-- SMUI Styles -->
    <link
            rel="stylesheet"
            href="node_modules/svelte-material-ui/themes/svelte.css"
            media="(prefers-color-scheme: light)"
    />

</svelte:head>

<script>
    import Keyboard from "svelte-keyboard"
    import Key from './components/Key.svelte'
    import StrategyDriver from "./components/StrategyDriver.svelte";
    import {guessStore, guessSubmitTrigger, targetWordStore, winTrigger} from "./stores/stores"
    import ProposalChooser from "./components/ProposalChooser.svelte";
    import Game from "./components/Game.svelte";
    import {CollapsiblePanel} from "@watergis/svelte-collapsible-panel";
    import SettingsChooser from "./components/SettingsChooser.svelte";
    import Card from '@smui/card';

    import {Fireworks} from 'fireworks-js'

    let fireworks;

    setTimeout(() => {
        const container = document.querySelector("#firework")
        console.warn("container", container);
        fireworks = new Fireworks(container, {
            acceleration: 1.01,
            intensity: 50,
            opacity: 0.8,
        });
    }, 1000);

    winTrigger.subscribe((win) => {
        if (win) {
            fireworks.launch(10);
        }
    })


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

    let wordaalLogo = [
        {value: "W", state: 0},
        {value: "o", state: 1},
        {value: "r", state: 2},
        {value: "d", state: 1},
        {value: "A", state: 0},
        {value: "A", state: 0},
        {value: "L", state: 2},
    ]

    let gameOptionsOpen = false;

</script>

<main>
    <div id="firework"></div>

    <div class="logo">
        {#each wordaalLogo as k, i}
            <Key {...k} clickable="true"/>
        {/each}
    </div>
    <br/>
    <i>UPPAAL Stratego playing Wordle</i>

    <div class="wrapper">
        <div class="left">
            <Game target="{$targetWordStore}"/>
        </div>
        <div class="right">
            <ProposalChooser/>
            <StrategyDriver/>
        </div>
    </div>

    <Keyboard layout="wordle" on:keydown={onWordleKeyDown}/>

    <CollapsiblePanel title={'Game options'} color={'black'} bind:isPanelOpen={gameOptionsOpen}>
        <Card padded>
            <SettingsChooser/>
        </Card>
    </CollapsiblePanel>
</main>

<style>
    .logo {
        transform: scale(1.25);
        margin: 0 auto;
        text-align: center;
    }

    .wrapper {
        display: flex;
        border: 1px solid grey;
        border-radius: 10px;
        padding: 32px 16px;
        overflow: hidden; /* will contain if #first is longer than #second */
        min-width: 850px;
    }

    .left {
        display: flex;
        flex-grow: 2;
        padding: 10px;

    }

    .right {
        display: flex;
        justify-content: center;
        flex-grow: 1;
        padding: 10px;
        overflow: hidden; /* if you don't want #second to wrap below #first */
        min-width: 450px;
    }

    #firework {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        pointer-events: none;
    }
</style>
