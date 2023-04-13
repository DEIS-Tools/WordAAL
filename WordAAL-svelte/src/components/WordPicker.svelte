<script type="module" lang="ts">
    import {
        WORDS,
        WORDS_STRINGIFIED,
        INDEX_LAST_CURATED_WORD,
        NPOS,
        convertStringToCharArray,
    } from '../lib/Consts.svelte';

    import {newGameTrigger, targetWordStore} from "../stores/stores.js";
    import {onMount} from "svelte";
    import Button from "@smui/button";
    import Textfield from "@smui/textfield";
    import AutoComplete from "simple-svelte-autocomplete"

    onMount(() => {
        randomTargetWord();
    });

    let selectedTargetWord: string = "";

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

        //fixme: DEBUG hardcoding target for testing
        /*target = "bidet"; //hardcode target word
        chars = convertStringToCharArray(target)
        index = WORDS_STRINGIFIED.indexOf(target);
        console.warn("wordpicker: DEBUG set target to " + target + " (index " + index + ")" + " (chars " + chars + ")");*/

        targetWordStore.set({cleartext: target, index: index, chars: chars});
    }

    $:{
        // when targetWordStore changes, log it
        console.log("target word changed to", $targetWordStore.cleartext);
    }


    // when selectedTargetWord changes, find its index in WORDS and set targetWordStore accordingly
    $: {
        if (selectedTargetWord !== "") {
            let index = WORDS_STRINGIFIED.indexOf(selectedTargetWord);
            let chars = convertStringToCharArray(selectedTargetWord);
            targetWordStore.set({cleartext: selectedTargetWord, index: index, chars: chars});
        }
    }

    //fixme: rewrite to update store statement
    $: {
        if ($newGameTrigger) {
            randomTargetWord();
        }
    }

</script>

<div class="wordPicker">
    <Button variant="raised" on:click={randomTargetWord}>Pick random target word</Button>
    <div class="targetWord">
        <Textfield variant="filled" bind:value={$targetWordStore.cleartext} label="Word to guess"/>
    </div>
    <div>
        <AutoComplete items="{WORDS_STRINGIFIED}" bind:selectedItem="{selectedTargetWord}"
                      placeholder="Choose word from wordlist" hideArrow="true" maxItemsToShowInList="5" showClear="true"/>

    </div>

</div>

<style>
    .targetWord:hover {
        -webkit-filter: blur(0px);
    }

    .targetWord {
        -webkit-transition: all 0.5s ease;
        -moz-transition: all 0.5s ease;
        -o-transition: all 0.5s ease;
        -ms-transition: all 0.5s ease;
        transition: all 0.5s ease;
        filter: blur(5px);

    }

    .wordPicker {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>

