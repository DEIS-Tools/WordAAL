<script type="module">
    import {WORDS, INDEX_LAST_CURATED_WORD, NPOS} from '../lib/Consts.svelte';

    import {newGameTrigger, targetWordStore} from "../stores/stores.js";
    import {onMount} from "svelte";

    onMount(() => {
        randomTargetWord();
    });
    function randomTargetWord() {

        let only_curated = true;

        const index = Math.floor(Math.random() * (only_curated ? INDEX_LAST_CURATED_WORD : WORDS.length));

        //const index = 1854; // word: speak
        console.log(WORDS[1854])
        var target = WORDS[index];
        for (var i = 0; i < NPOS; i++) {
            target[i] = String.fromCharCode(WORDS[index][i] + 97);
        }
        target = target.join('');
        console.log("target word: " + target + " at i: " + index);
        targetWordStore.set({cleartext: target, index: index, chars: WORDS[index]});
    }

    $: {
        if ($newGameTrigger) {
            randomTargetWord();
            newGameTrigger.set(false);
        }
    }

</script>

<div>
    <button on:click={randomTargetWord}>Pick new word</button>
    <input bind:value={$targetWordStore['cleartext']} placeholder="Word to guess" id="targetWord">
</div>

<style>
#targetWord:hover input{display:block;}
</style>

