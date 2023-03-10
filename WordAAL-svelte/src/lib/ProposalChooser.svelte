<script>
    import {proposalsStore} from "./stores.js";
    import Key from "./Key.svelte";

    /*
     on proposalsStore change:
        - generate rows of Key-component words for each proposal
        - on click, generate event for StrategyDriver
     */


    // autosub to proposalsStore
    let proposals = [];
    $: {
        let p = $proposalsStore;
        // check type is array
        if (!Array.isArray(p)) {
            console.log("proposalsStore is not an array, perhaps StrategyDriver has not completed");
        } else {
            console.log("proposalsStore from ProposalChooser");
            // log word and cost for each
            p.forEach((proposal) => {
                console.log(proposal.word, proposal.cost);
            });
            proposals = p.slice(0, 3);
        }
    }

    function propose(wid) {
        console.log("proposal clicked: " + wid);
    }

</script>
<div id="divider"></div>
<div class="proposals-box">
    <table>
        <tr>
            {#each proposals as proposal}
                <div class="proposal" id="proposal-wid-{proposal.wid}" on:click={propose(proposal.wid)}>
                    <tr>
                        <td>
                            {#each proposal.word as char}
                                <Key value={char.toUpperCase()} state="2"/>
                            {/each}
                        </td>
                        <td>
                            ({proposal.cost}) <br/>
                        </td>
                    </tr>
                </div>

            {/each}
        </tr>
    </table>
</div>

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
        padding: 5px;
        margin: 5px;
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
        padding: 5px;
        margin: 5px;
    }
</style>