<script>
    import {guessStore, guessSubmitTrigger, proposalsStore} from "../stores/stores.js";
    import Key from "./Key.svelte";

    /*
     on proposalsStore change:
        - generate rows of Key-component words for each proposal
        - on click, generate event for StrategyDriver
     */


    // autosub to proposalsStore
    let proposals = [];
    export let num_results = 5;
    $: {
        let p = $proposalsStore;
        // check type is array
        if (!Array.isArray(p)) {
            console.log("proposalsStore is not an array, perhaps StrategyDriver has not finished");
        } else {
            // log word and cost for each
            p.forEach((proposal) => {
                //console.log(proposal.word, proposal.cost);
            });
            let topN = p.slice(0, num_results);
            console.log(topN);
            proposals = topN;
        }
    }

    function propose(guess) {
        console.log("proposal chosen: " + guess);
        guessStore.set(guess);
        guessSubmitTrigger.set(true);
    }

</script>

<!--For each proposal, render them as five keys with state=2. Linebreak s.t. subsequent proposals are placed below the previous -->
{#each proposals as proposal}
    <div class="proposals-box">
        <div class="proposal" on:click={() => propose(proposal.word)}>
            {#each proposal.word as letter}
                <Key value={letter} state={2}/>
            {/each}
            <div style="margin-left: 5px; margin-right: 5px;">{proposal.cost.toFixed(2)}</div>

        </div>
    </div>
{/each}


<style>

    #divider {
        width: 350px;
        border-bottom: black 1px solid;
        display: flex;
    }

    /* proposal should be left-adjusted and not stretched */
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

    /* align proposals-box to right*/
    .proposals-box {
        display: flex;
        flex-direction: row;
        float: inside;
    }
</style>