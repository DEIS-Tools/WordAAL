<script>
    import {strategyStore} from "../stores/stores.js";
    import SegmentedButton, { Segment } from '@smui/segmented-button';
    import { Label } from '@smui/common';
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';


    let hardmode = false;
    let strat = 0
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

    //todo, restrict permissive choice to no hard mode w/ alert when choosing

    function setStrategyConfigStore(s, mode) {
        // return if no strategy selected
        console.log("setting strategy config stores", s, mode)
        if (s === 0) return;
        strategyStore.set({
            idx: s['idx'],
            hard: mode,
        });
    }

    // force update when strat changes
    $: setStrategyConfigStore(strat, hardmode)

</script>



<div class="strategies">
    <SegmentedButton segments={availableStrats} let:segment singleSelect bind:strat>
        <!-- Note: the `segment` property is required! -->
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