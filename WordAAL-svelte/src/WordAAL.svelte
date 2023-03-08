<script>
    import aauLogo from './static/aau-logo.png'
    import Counter from './lib/Counter.svelte'
    import Keyboard from "svelte-keyboard"
    import Key from './lib/Key.svelte'
    import Strategy from "./lib/StrategyChooser.svelte";

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
        return
        if (event.detail['strategy'] !== 0) { // if legal config
            console.log(event.detail)
        }

    }

</script>

<main>
    <img class="logo" src={aauLogo}>
    <div class="card">
        {#each wordaalLogo as k}
            <Key {...k}/>
        {/each}
    </div>
    <Strategy on:strategyConfig={handleStrategyConfig}/>


    <div>
        <div class="card">
            <Keyboard layout="wordle" on:keydown={onKeydown}/>
        </div>
        <div class="button">

        </div>
    </div>
</main>

<style>
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
