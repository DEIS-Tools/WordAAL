<script lang="ts">
    import {
        guessStore,
        guessSubmitTrigger,
        newGameTrigger,
        proposalsStore,
        hideProposalsStore
    } from "../stores/stores.js";
    import Key from "./Key.svelte";
    import {fly} from 'svelte/transition';
    import CircularProgress from '@smui/circular-progress';
    import Chip, {Set, Text} from '@smui/chips';

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

    function costShade(cost) {
        let min = Math.min(...proposals.map(proposal => proposal.cost));
        let max = Math.max(...proposals.map(proposal => proposal.cost));

        // normalise cost to be between 0 and 1 based on min and max
        cost = (cost - min) / (max - min);

        // use sigmoid between calculated min and max to get a color
        let r = 255 * (1 / (1 + Math.exp(-10 * (cost - 0.5))));
        let g = 255 * (1 / (1 + Math.exp(-10 * (0.5 - cost))));

        // make r and g less harsh
        r = r * 0.5 + 127.5;
        g = g * 0.5 + 127.5;

        return `rgb(${r}, ${g}, 0)`;
    }


</script>

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
                <Set chips={['1']} let:chip nonInteractive>
                    <Chip {chip}>
                        <p class="cost" style:color={costShade(proposal.cost)}> &nbsp;{proposal.cost.toFixed(3)} &nbsp;</p>
                    </Chip>
                </Set>
                <!--<p style:color={costShade(proposal.cost)}> &nbsp;{proposal.cost.toFixed(3)} &nbsp;</p>-->

            </div>
        </div>
    {/each}
{/if}

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


<style>
    .cost {
        font-size: 20px;
        font-weight: bold;
        -webkit-text-stroke: 1px rgba(124, 107, 107, 0.81);
    }
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