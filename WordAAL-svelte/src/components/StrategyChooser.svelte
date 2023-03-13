<script>
    import {strategyStore} from "../stores/stores.js";

    let hardmode = false;
    let strat = 0
    let availableStrats = [
        {
            name: "combined",
            desc: "Combined - both conservative and permissive",
            idx: 1
        },
        {
            name: "conservative",
            desc: "Conservative - any prior gray hints respected s.t. no future guesses contain these non-existing letters",
            idx: 0,
        },
        {
            name: "permissive",
            desc: "Permissive - any new guess must change the internal knowledge structure",
            idx: 2
        },
    ]

    //todo, restrict permissive choice to no hard mode w/ alert when choosing

    function setStrategyConfigStore(s, mode) {
        // return if no strategy selected
        console.log("setting strategy config stores", s, mode)
        if (s === 0) return;
        strategyStore.set({
            idx: s['idx'],
            hard: mode,
        });
    }

    // force update when strat changes
    $: setStrategyConfigStore(strat, hardmode)

</script>
<div>
    <div class="strat-select">
        <h4>Strategy selection:</h4>
        {#each availableStrats as s}
            <label>
                <input type="radio" bind:group={strat} value="{s}">
                {s.name}
            </label><br>
        {/each}
        <label>
            <input type="checkbox" bind:checked={hardmode} value="false">
            Hard-mode<!-- - must use existing hints in subsequent guesses-->
        </label><br>
    </div>
    <div class="active-strategy">
    {#if strat === 0}
        <h4>Please select a strategy to play with</h4>
    {:else}
        <h4>Playing with {strat.name} strategy
            {#if hardmode} on hard-mode{/if}
        </h4>
    {/if}
    </div>
</div>
<style>
    .strat-select {
        text-align: left;
        padding: 2em;
    }
    /* active strategy in box*/
    .active-strategy {
        text-align: center;
        padding: 1em;
        border: 1px solid black;
        border-radius: 5px;
    }
</style>