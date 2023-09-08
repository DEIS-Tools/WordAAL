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
    <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/svelte-material-ui@6.0.0/bare.min.css"
    />
</svelte:head>

<script>
    import Keyboard from "svelte-keyboard"
    import Key from './components/Key.svelte'
    import StrategyDriver from "./components/StrategyDriver.svelte";
    import {
        guessStore,
        guessSubmitTrigger,
        knowledgeStore,
        targetWordStore,
        globalCountsStore,
        knowledgeHtmlStore,
        debugModeStore
    } from "./stores/stores"
    import ProposalChooser from "./components/ProposalChooser.svelte";
    import Game from "./components/Game.svelte";
    import {CollapsiblePanel} from "@watergis/svelte-collapsible-panel";
    import SettingsChooser from "./components/SettingsChooser.svelte";
    import Card from '@smui/card';
    import InfoCard from "./components/InfoCard.svelte";
    import {onMount} from "svelte";
    import {WordleColours} from './lib/Consts.svelte'

    let hideWelcomeInfo = false;
    onMount(() => {
        console.log("cookie", document.cookie)
        if (
            document.cookie.split(";").some((item) =>
                item.trim().includes("wordaalWelcomeCardShow=0"))) {
            hideWelcomeInfo = true;
        }
    });

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
        {value: "d", state: 3},
        {value: "A", state: 0},
        {value: "A", state: 1},
        {value: "L", state: 2},
    ]

    let gameOptionsOpen = false;


    $: updateKeyboardShading($knowledgeStore, $globalCountsStore);


    function updateKeyboardShading(knowledge, counts) {

        if (knowledge.length < 1 || knowledge[0] === undefined) {
            return;
        }
        // jank method of getting keyboard key elements (fix if exchanging keyboard to other component)
        let keys = Array.from(document.querySelectorAll('[class^="key key--"]'));

        const combKnowledge = knowledge.reduce((acc, curr) => {
            return acc.map((value, index) => Math.max(value, curr[index]));
        });
        keys.forEach(key => {
            let letter = key.innerHTML.toLowerCase();
            if (letter.length === 1) {
                let key_color = WordleColours.UNKNOWN;

                let char = letter.charCodeAt(0) - 97;
                if (counts[char] > 0) {
                    key_color = WordleColours.WRONG_POSITION;
                }
                if (combKnowledge[char] === 1) {
                    key_color = WordleColours.CORRECT;
                } else if (combKnowledge[char] === -1) {
                    key_color = WordleColours.INCORRECT;
                }
                // set shading
                key.style.backgroundColor = key_color;
            }
        });

    }

    let knowledgeHTML = null;
    knowledgeHtmlStore.subscribe((value) => {
        knowledgeHTML = value;
    });

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
            <div class="mdc-typography--headline5 header">Wordle game</div>
            <Game target="{$targetWordStore}"/>
        </div>
        <div class="right">
            <div class="mdc-typography--headline5 header">UPPAAL Stratego suggestions</div>
            <ProposalChooser/>
        </div>
        <StrategyDriver/>
    </div>
    <br>
    <center>
        {#if $debugModeStore}
            <div>
                {@html knowledgeHTML}
            </div>
        {/if}
    </center>

    <Keyboard layout="wordle" --background="#dce1ed" --active-background="#6F7685" --text-transform="capitalize"
              --active-transform="bold" on:keydown={onWordleKeyDown}/>

    <CollapsiblePanel title={'Game options'} color={'black'} bind:isPanelOpen={gameOptionsOpen}>
        <Card padded>
            <SettingsChooser/>
        </Card>
    </CollapsiblePanel>

    <InfoCard show={!hideWelcomeInfo} text="<b>Welcome to WordAAL alpha</b>: A Wordle game enhanced with UPPAAL Stratego assistance.<br/>
    Explore how different strategies prioritise guesses on any target word in the Wordle word-list.<br/>
    The purpose of this game is to showcase the capabilities of UPPAAL Stratego at conferences.<br/>
    Please interact with the demo and submit feedback through channels below.<br/>
"/>
</main>

<style lang="scss">
  .logo {
    transform: scale(1.25);
    margin: 0 auto;
    text-align: center;
  }

  .wrapper {
    display: flex;
    border-radius: 10px;
    padding: 15px;
    overflow: hidden; /* will contain if #first is longer than #second */
    min-width: 850px;
    min-height: 320px;
    box-shadow: 1px 2px 3px 1px rgba(0, 0, 0, 0.5);
    margin-bottom: 10px;

  }

  .left {
    display: flex;
    flex-grow: 2;
    flex-direction: column;
    padding: 10px;
    box-shadow: 1px 2px 3px 1px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    margin: 15px;
    min-height: 402px;
    background-color: rgb(121, 184, 81, 0.2);
  }

  .right {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    padding: 10px;
    overflow: hidden;
    min-width: 450px;
    margin: 15px;
    box-shadow: 1px 2px 3px 1px rgba(0, 0, 0, 0.4);
    border-radius: 10px;
    min-height: 402px;
    background-color: rgb(243, 194, 55, 0.2);
  }

  .header {
    text-align: center;
    margin-bottom: 10px;
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
