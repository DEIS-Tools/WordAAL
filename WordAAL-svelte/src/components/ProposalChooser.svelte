<script lang="ts">
    import {
        guessStore,
        guessSubmitTrigger,
        newGameTrigger,
        proposalsStore,
        hideProposalsStore
    } from "../stores/stores.js";
    import Key from "./Key.svelte";
    import {fly, fade} from 'svelte/transition';
    import CircularProgress from '@smui/circular-progress';
    import Chip, {Set, Text, TrailingIcon} from '@smui/chips';

    import {NUM_PROPOSALS} from "../lib/Consts.svelte"

    let loading = true;
    let proposals = [];

    $: {
        // when new game is triggered, clear the proposals
        if ($newGameTrigger) {
            proposals = [];
        }
    }

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


    $: {
        let p = $proposalsStore;
        if (Array.isArray(p)) {
            proposals = p.filter(proposal => proposal.cost !== Infinity).slice(0, NUM_PROPOSALS);
            loading = false;
        }
    }

    function propose(guess) {
        loading = true;
        setTimeout(() => {
            guessStore.set(guess);
            guessSubmitTrigger.set(true);
        }, 100);
    }
</script>

<div class={$hideProposalsStore ? "proposal-box-blur" : "proposal-box"} transition:fly={{x:100, duration: 500}}>
    {#if loading}
        <div class="loading" in:fade={{x:100, duration: 500}}>
            <CircularProgress style="height: 80px; width: 80px;" indeterminate/>
            Loading proposals...
        </div>
    {:else}
        <div in:fade={{duration:500}}>
        {#each proposals as proposal}
            <div class="proposal" on:click={() => {propose(proposal.word)}}>
                {#each proposal.word as letter, letterIndex}
                    <Key value={letter.toUpperCase()} state={proposal.knowledge[letterIndex]}/>
                {/each}
                <Set chips={['1']} let:chip nonInteractive>
                    <Chip {chip}>
                        <Text><p class="cost" style:color={costShade(proposal.cost)}> &nbsp;{proposal.cost.toFixed(3)}
                            &nbsp;</p>
                        </Text>
                        <TrailingIcon class="material-icons">payments</TrailingIcon>
                    </Chip>
                </Set>
            </div>
        {/each}
        </div>
    {/if}
</div>


<style>
    .cost {
        font-size: 24px;
        font-weight: bold;
        -webkit-text-stroke: 1px rgba(124, 107, 107, 0.81);
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
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

    .loading {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .proposal-box {
        display: flex;
        flex-direction: column;
    }

    .proposal-box-blur {
        display: flex;
        flex-direction: column;
        -webkit-transition: all 0.5s ease;
        -moz-transition: all 0.5s ease;
        -o-transition: all 0.5s ease;
        -ms-transition: all 0.5s ease;
        transition: all 0.5s ease;
        filter: blur(5px);
        pointer-events: none;
    }

</style>