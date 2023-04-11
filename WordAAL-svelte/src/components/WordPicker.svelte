<script type="module" lang="ts">
    import {WORDS, INDEX_LAST_CURATED_WORD, NPOS, convertStringToCharArray} from '../lib/Consts.svelte';

    import {newGameTrigger, targetWordStore} from "../stores/stores.js";
    import {onMount} from "svelte";
    import Button from "@smui/button";
    import Textfield from "@smui/textfield";
    import Autocomplete from '@smui-extra/autocomplete';
    import {Text} from '@smui/list';
    import CircularProgress from '@smui/circular-progress';

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
        target = "meter"; //hardcode target word
        chars = convertStringToCharArray(target)
        index = 1225;
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

    // todo; implement fuzzy autocomplete search in wordlist
    /*
        let counter = 0;

        async function searchItems(input: string) {
            if (input === '') {
                return [];
            }

            // Pretend to have some sort of canceling mechanism.
            const myCounter = ++counter;

            // Pretend to be loading something...
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // This means the function was called again, so we should cancel.
            if (myCounter !== counter) {
                // `return false` (or, more accurately, resolving the Promise object to
                // `false`) is how you tell Autocomplete to cancel this search. It won't
                // replace the results of any subsequent search that has already finished.
                return false;
            }


            // Return a list of matches.
            return WORDS.filter((item) =>
                item.toLowerCase().includes(input.toLowerCase())
            );
        }

        let value: string | undefined = undefined;


    */

    let selectedTargetWord: string = "";

    let words = ["apple", "cedar", "meter"];

</script>

<div class="wordPicker">
    <Button variant="raised" on:click={randomTargetWord}>Pick random target word</Button>
    <div class="targetWord">
        <Textfield variant="filled" bind:value={$targetWordStore['cleartext']} label="Word to guess"/>
    </div>
    <div class="targetWord">
        <Autocomplete options={words} bind:value={selectedTargetWord} label="Choose word from wordlist"/>
    </div>
    <!--<div>
        <Autocomplete
                search={searchItems}
                bind:value
                showMenuWithNoInput={false}
                label="Choose word from wordlist"
        >
            <Text
                    slot="loading"
                    style="display: flex; width: 100%; justify-content: center; align-items: center;"
            >
                <CircularProgress style="height: 24px; width: 24px;" indeterminate/>
            </Text>
        </Autocomplete>
        <pre class="status">Selected: {value || ''}</pre>
    </div>-->
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
        /*filter: blur(5px);*/

    }

    .wordPicker {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>

