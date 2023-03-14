<script>
    import {responseHistoryStore} from '../stores/stores.js';
    import Key from "./Key.svelte";
</script>

<div class="history">
    <table>
        <tr>
            {#if ($responseHistoryStore !== undefined && $responseHistoryStore.length > 0)}
                {#if $responseHistoryStore[0].length > 0}
                    {#each $responseHistoryStore as responseHistory, idxWord}
                        {idxWord + 1}
                        {#each responseHistory as guess, idxLetter}
                            <Key value={guess[0].toUpperCase()}
                                 state={guess[1]}/>
                        {/each}
                        <br/>

                    {/each}
                {/if}
            {/if}
        </tr>
    </table>
</div>

<style>

    /* proposal should be left-adjusted and not stretched */
    .history-row {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        padding: 5px;
        margin: 5px;
        background-color: rgba(255, 255, 255, 0.81);
    }

    .history-row:hover {
        background-color: rgba(150, 238, 150, 0.81);
    }

    /* align proposals-box to right*/
    .history {
        display: flex;
        flex-direction: row;
        float: inside;
        padding: 5px;
        margin: 5px;
    }

</style>