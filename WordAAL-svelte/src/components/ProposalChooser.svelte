<script>
    import {guessStore, guessSubmitTrigger, newGameTrigger, proposalsStore} from "../stores/stores.js";
    import Key from "./Key.svelte";
    import {NUM_PROPOSALS} from "../lib/Consts.svelte"

    let proposals = [];

    $: {
        let p = $proposalsStore;
        if (!Array.isArray(p)) {
            console.log("proposalsStore is not an array, perhaps StrategyDriver has not finished");
        } else {
            // filter off all proposals with cost === Infinity
            p = p.filter(proposal => proposal.cost !== Infinity);
            proposals = p.slice(0, NUM_PROPOSALS);
        }
    }

    function propose(guess) {
        console.log("propose word: " + guess);
        guessStore.set(guess);
        guessSubmitTrigger.set(true);
    }

    $: {
        // when new game is triggered, clear the proposals
        if ($newGameTrigger) {
            proposals = [];
        }
    }

</script>
{#each proposals as proposal}
    <div class="proposals-box">
        <div class="proposal" on:click={() => propose(proposal.word)}>
            {#each proposal.word as letter, letterIndex}
                <Key value={letter.toUpperCase()} state={proposal.knowledge[letterIndex]}/>
            {/each}
            <div style="margin-left: 5px; margin-right: 5px;">{proposal.cost.toFixed(3)}</div>

        </div>
    </div>
{/each}


<style>
    .proposal {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.81);
    }

    .proposal:hover {
        background-color: rgba(150, 238, 150, 0.81);
    }

    .proposals-box {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }
</style>