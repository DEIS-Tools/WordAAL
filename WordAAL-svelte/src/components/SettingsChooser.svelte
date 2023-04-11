<script lang="ts">
    import WordPicker from "./WordPicker.svelte";
    import StrategyChooser from "./StrategyChooser.svelte";
    import FormField from "@smui/form-field";
    import Switch from "@smui/switch";

    import {hideProposalsStore} from "../stores/stores.js";

    let hideProposals = false;

    $: hideProposalsStore.set(hideProposals);
</script>


<WordPicker/>
<StrategyChooser/>

<FormField>
    <p>Blur proposals:</p>
    <Switch bind:checked={hideProposals} touch/>
</FormField>


<style lang="scss">

</style>