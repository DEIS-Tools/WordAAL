<script type="module">
    import {WORDS, INDEX_LAST_CURATED_WORD, NPOS, convertStringToCharArray} from '../lib/Consts.svelte';

    import {newGameTrigger, targetWordStore} from "../stores/stores.js";
    import {onMount} from "svelte";
    import Button from "@smui/button";
    import Textfield from "@smui/textfield";

    onMount(() => {
        randomTargetWord();
    });

    function randomTargetWord() {
        let onlyCurated = true;

        let index = Math.floor(Math.random() * (onlyCurated ? INDEX_LAST_CURATED_WORD : WORDS.length));

        // clone WORDS[index] to target
        let target = JSON.parse(JSON.stringify(WORDS[index]));
        for (let i = 0; i < NPOS; i++) {
            target[i] = String.fromCharCode(WORDS[index][i] + 97);
        }
        target = target.join('');
        let chars = WORDS[index];

        // DEBUG
        target = "abuse"; //hardcode target word
        chars = convertStringToCharArray(target)
        index = 12;
        console.warn("wordpicker: DEBUG set target to " + target + " (index " + index + ")" + " (chars " + chars + ")");

        targetWordStore.set({cleartext: target, index: index, chars: chars});
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

