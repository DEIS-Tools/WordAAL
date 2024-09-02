<script>
    import {strategyStore} from "../stores/stores.js";
    import SegmentedButton, {Segment} from '@smui/segmented-button';
    import {Label} from '@smui/common';
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';
    import Tooltip, { Wrapper } from '@smui/tooltip';
    import {setCookieItem} from "../lib/Consts.svelte";



    let availableStrats = [
        {
            name: "combined",
            desc: "Combined - both conservative and permissive",
            location: "COMB_PT.json",
            location_hard: "COMB_HM_PT.json"
        },
        {
            name: "conservative",
            desc: "Conservative - any prior gray hints respected s.t. no future guesses contain these non-existing letters",
            location: "CONS_PT.json",
            location_hard: "CONS_HM_PT.json"
        },
        {
            name: "permissive",
            desc: "Permissive - any new guess must change the internal knowledge structure",
            location_hard: "PERM_HM_PT.json",
        },
    ]

    let strategy = availableStrats[1];

    let hard = true;
    $: {
        if (strategy.name === "permissive" && !hard) {
            alert("Permissive mode is only compatible with hard mode - turning it on now.")
            hard = true;
        }

        // set strategy config store
        let s = availableStrats.find(s => s.name === strategy.name);
        if (s !== undefined) {
            strategyStore.set({s, hard: hard});
        } else {
            console.error("strategy index not found")
        }

        setCookieItem("wordaalStrategy", strategy.name);
        setCookieItem("wordaalHard", hard);
    }




</script>
    <div class="strategies">
        <p>Strategy:&nbsp;</p>
        <SegmentedButton segments={availableStrats} let:segment singleSelect bind:selected={strategy}>
            <Wrapper>
            <Segment {segment} touch title={segment.name}>
                <Label>{segment.name}</Label>
            </Segment>
                <Tooltip>
                    {segment.desc}
                </Tooltip>
            </Wrapper>
        </SegmentedButton>
        <p>&nbsp;Hard-mode:</p>
        <FormField>
            <Switch bind:checked={hard} touch/>
        </FormField>
    </div>


<style>
    .strategies {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        border-radius: 5px;
    }
</style>