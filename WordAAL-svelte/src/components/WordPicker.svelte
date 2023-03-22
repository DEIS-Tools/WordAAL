<script type="module">
    import {WORDS, INDEX_LAST_CURATED_WORD, NPOS} from '../lib/Consts.svelte';

    import {newGameTrigger, targetWordStore} from "../stores/stores.js";
    import {onMount} from "svelte";
    import Button from "@smui/button";
    import Textfield from "@smui/textfield";

    onMount(() => {
        randomTargetWord();
    });

    function randomTargetWord() {
        let onlyCurated = true;

        const index = Math.floor(Math.random() * (onlyCurated ? INDEX_LAST_CURATED_WORD : WORDS.length));

        // clone WORDS[index] to target
        let target = JSON.parse(JSON.stringify(WORDS[index]));
        for (let i = 0; i < NPOS; i++) {
            target[i] = String.fromCharCode(WORDS[index][i] + 97);
        }
        target = target.join('');
        //target = "raise"; //hardcode target word
        targetWordStore.set({cleartext: target, index: index, chars: WORDS[index]});
    }

    //fixme: rewrite to update store statement
    $: {
        if ($newGameTrigger) {
            randomTargetWord();
            newGameTrigger.set(false);
        }
    }

</script>

<div>
    <Button variant="raised" on:click={randomTargetWord}>Pick new word</Button>
    <Textfield variant="filled" bind:value={$targetWordStore['cleartext']} label="Word to guess" disabled/>
</div>

<style>
    #targetWord:hover {
        display: block;
    }

    #targetWord {
        display: none;
    }
</style>

