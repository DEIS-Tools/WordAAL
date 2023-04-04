<script lang="ts">
    import {guessStore, guessSubmitTrigger, newGameTrigger, proposalsStore, hideProposalsStore} from "../stores/stores.js";
    import Key from "./Key.svelte";
    import {fly} from 'svelte/transition';
    import CircularProgress from '@smui/circular-progress';

    import {NUM_PROPOSALS} from "../lib/Consts.svelte"

    let proposals = [];

    $: {
        let p = $proposalsStore;
        if (Array.isArray(p)) {
            p = p.filter(proposal => proposal.cost !== Infinity);
            proposals = p.slice(0, NUM_PROPOSALS);
        }
    }

    function propose(guess) {
        proposals = [];
        setTimeout(() => {
            guessStore.set(guess);
            guessSubmitTrigger.set(true);
        }, 50);
    }

    $: {
        // when new game is triggered, clear the proposals
        if ($newGameTrigger) {
            proposals = [];
        }
    }

    /*    let promise = proposalsStore.subscribe(proposals => {
            if (Array.isArray(proposals)) {
                proposals = proposals.filter(proposal => proposal.cost !== Infinity);
                return proposals.slice(0, NUM_PROPOSALS);
            }
        });*/

</script>

<!--FIXME: Async attempt-->
<!--{#await promise}
    <div class="loading">
        <CircularProgress style="height: 64px; width: 64px;" indeterminate/>
        <p>Loading proposals...</p><br/>
    </div>
{:then foo}
    {#each proposals as proposal}
        <div class="proposals-box" transition:fly={{x:100, duration: 500}}>
            <div class="proposal" on:click={() => propose(proposal.word)}>
                {#each proposal.word as letter, letterIndex}
                    <Key value={letter.toUpperCase()} state={proposal.knowledge[letterIndex]}/>
                {/each}
                <div style="margin-left: 5px; margin-right: 5px;">{proposal.cost.toFixed(3)}</div>

            </div>
        </div>
    {/each}
{:catch error}
    <div class="loading">
        <p>Error loading proposals: {error}</p><br/>
    </div>
{/await}-->


{#if proposals.length === 0}
    <div class="loading">
        <CircularProgress style="height: 64px; width: 64px;" indeterminate/>
        <p>Loading proposals...</p><br/>
    </div>
{:else}
    {#each proposals as proposal}
        <div class={$hideProposalsStore ? "proposal-box-blur" : "proposal-box"} transition:fly={{x:100, duration: 500}}>
            <div class="proposal" on:click={() => propose(proposal.word)}>
                {#each proposal.word as letter, letterIndex}
                    <Key value={letter.toUpperCase()} state={proposal.knowledge[letterIndex]}/>
                {/each}
                <div style="margin-left: 5px; margin-right: 5px;">{proposal.cost.toFixed(3)} &nbsp;</div>

            </div>
        </div>
    {/each}
{/if}

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

    .loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }


    .proposal-box-blur {
        -webkit-transition: all 0.5s ease;
        -moz-transition: all 0.5s ease;
        -o-transition: all 0.5s ease;
        -ms-transition: all 0.5s ease;
        transition: all 0.5s ease;
        filter: blur(5px);

    }

</style>