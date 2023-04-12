<script lang="ts">
    import WordPicker from "./WordPicker.svelte";
    import StrategyChooser from "./StrategyChooser.svelte";
    import FormField from "@smui/form-field";
    import Switch from "@smui/switch";

    import {hideProposalsStore} from "../stores/stores.js";
</script>

<div class="option-row">
    <StrategyChooser/>
    <FormField>
        <p>Blur proposals:</p>
        <Switch bind:checked={$hideProposalsStore} touch/>
    </FormField>
</div>
<WordPicker/>

<style>
    .option-row {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        border-radius: 5px;
    }
</style>