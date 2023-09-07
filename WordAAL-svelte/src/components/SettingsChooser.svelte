<script lang="ts">
    import WordPicker from "./WordPicker.svelte";
    import StrategyChooser from "./StrategyChooser.svelte";
    import FormField from "@smui/form-field";
    import Switch from "@smui/switch";

    import {hideProposalsStore, debugModeStore} from "../stores/stores.js";
    import Button from "@smui/button";
</script>

<div class="option-row">
    <StrategyChooser/>
    <FormField>
        <p>Blur proposals:</p>
        <Switch bind:checked={$hideProposalsStore} touch/>
    </FormField>

</div>
<WordPicker/>
<div class="option-row">
    <Button variant="raised" on:click={() => (location.reload())}>
        New game
    </Button> &nbsp;
    <Button variant="raised"
            on:click={() => {
                document.cookie = "wordaalWelcomeCardShow=0; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
                location.reload()
            }}>
        Show welcome information
    </Button>
    <FormField>
        <p>Debug mode:</p>
        <Switch bind:checked={$debugModeStore} touch/>
    </FormField>
</div>

<style>
    .option-row {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        border-radius: 5px;
    }
</style>