<script>
    import {responseHistoryStore, targetWordStore, responseStore} from '../stores/stores.js';
    import {ASCII_OFFSET, NPOS} from "../lib/Consts.svelte";
    import Key from "./Key.svelte";


    let responses = [];

    $: {
        responses = $responseHistoryStore;
    }


</script>

<div class="history">
    <table>
        <tr>
            {#if ($responseHistoryStore.length > 0)}
                {#each $responseHistoryStore as responseHistory, idxWord}
                    {#each responseHistory as guess, idxLetter}
                        <!--{guess[0]} {idxLetter}-->
                        <Key value={guess[0].toUpperCase()}
                             state={guess[1]}/>
                    {/each}
                    <br/>

                {/each}
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
        border-radius: 5px;
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