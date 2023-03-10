<script>
    import {responseHistoryStore} from './stores.js';
    import {ASCII_OFFSET} from "./Consts.svelte";
    import Key from "./Key.svelte";

    /*
    when responseHistoryStore changes, update the chart
     */


    function convertResponse(mapResponseGuess) {
        for (let [key, value] of mapResponseGuess) {
            console.log(String.fromCharCode(key + ASCII_OFFSET) + ' has status ' + value);
        }
    }


</script>


<div class="history">
    <table>
        <tr>
            {#each $responseHistoryStore as responseHistory, idxWord}
                <tr>
                    <td>
                        <div class="history-row">
                            {#each responseHistory as guess, idxLetter}
                                <Key value={String.fromCharCode(guess[0] + ASCII_OFFSET).toUpperCase()}
                                     state={guess[1]}/>
                                <br/>
                            {/each}

                        </div>
                    </td>
                </tr>
            {/each}
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