<script>
    import {NLETTER, NPOS, NWORDS, WORDS} from "./Consts.svelte";
    import Key from "./Key.svelte";

    export function wordleResponse(target, guess) {
        const correctLetters = new Set(target);
        let response = [-1, -1, -1, -1, -1];

        for (let i = 0; i < NPOS; i++) {
            if (guess[i] === target[i]) {
                response[i] = [guess[i], 0];
            } else if (correctLetters.has(guess[i])) {
                response[i] = [guess[i], 1];
            } else {
                response[i] = [guess[i], 2];
            }
        }
        return response
    }
</script>

Demo response:
{#each wordleResponse("hello", "cedho") as k}
    <Key value={k[0].toUpperCase()} state={k[1]}/>
{/each}
