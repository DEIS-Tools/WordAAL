<script>
    import {strategyStore} from "../stores/stores.js";
    import SegmentedButton, {Segment} from '@smui/segmented-button';
    import {Label} from '@smui/common';
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';


    let hard = false;
    let strategy = {
        name: "combined",
        desc: "Combined - both conservative and permissive",
        idx: 1
    };
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
    }

</script>


<div class="strategies">
    <SegmentedButton segments={availableStrats} let:segment singleSelect bind:selected={strategy}>
        <Segment {segment} touch title={segment.name}>
            <Label>{segment.name}</Label>
        </Segment>
    </SegmentedButton>
    <FormField>
        <Switch bind:checked={hard} touch/>
        <span slot="label">Hard-mode</span>
    </FormField>
</div>


<style>
    .strat-select {
        text-align: left;
        padding: 2em;
    }

    /* active strategy in box*/
    .active-strategy {
        text-align: center;
        padding: 1em;
    }
</style>