<script>
    import {strategyStore} from "../stores/stores.js";
    import SegmentedButton, {Segment} from '@smui/segmented-button';
    import {Label} from '@smui/common';
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';


    let hardmode = false;
    let strategy = {
        name: "combined",
        desc: "Combined - both conservative and permissive",
        idx: 1
    };
    let availableStrats = [
        {
            name: "combined",
            desc: "Combined - both conservative and permissive",
            idx: 1
        },
        {
            name: "conservative",
            desc: "Conservative - any prior gray hints respected s.t. no future guesses contain these non-existing letters",
            idx: 0,
        },
        {
            name: "permissive",
            desc: "Permissive - any new guess must change the internal knowledge structure",
            idx: 2
        },
    ]

    $: {
        if (strategy.name === "permissive" && hardmode) {
            alert("Permissive mode is not compatible with hard mode. Please choose a different strategy or turn off hard mode.")
            hardmode = false;
        } else {
            // set strategy config store
            let s_idx = availableStrats.find(s => s.name === strategy.name)['idx'];
            if (s_idx !== undefined) {
                strategyStore.set({
                    idx: s_idx,
                    hard: hardmode,
                });
            } else {
                console.error("strategy index not found")
            }
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
        <Switch bind:checked={hardmode} touch/>
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