<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let hardmode = false;
    export let strategy = 0
    let strategies = [
        {name: "combined", desc: "Combined - both conservative and permissive"},
        {
            name: "conservative",
            desc: "Conservative - any prior gray hints respected s.t. no future guesses contain these non-existing letters"
        },
        {name: "permissive", desc: "Permissive - any new guess must change the internal knowledge structure"},
    ]

    function emitStrategyConfig(strategy, hardmode) {
        dispatch('strategyConfig', {
            strategy,
            hardmode
        })
    }
    $: emitStrategyConfig(strategy, hardmode)

</script>
<div class="strat-select">
{#each strategies as s}
    <label>
        <input type="radio" bind:group={strategy} value="{s}">
        {s.desc}
    </label><br>
{/each}
<label>
    <input type="checkbox" bind:checked={hardmode}>
    Hard-mode
</label><br>
</div>
{#if strategy === 0}
    <h3>Please select a strategy to play with</h3>
{:else}
    <h3>Playing with {strategy.name} strategy
        {#if hardmode} on hard-mode{/if}
    </h3>
{/if}

<style>
    .strat-select {
        text-align: left;
        padding: 2em;
    }
</style>