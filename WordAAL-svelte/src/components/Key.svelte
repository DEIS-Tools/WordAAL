<script>
    export let value = " "
    // 0 = green, 1 = yellow, 2 = grey
    const states = [0, 1, 2];
    export let state = 0;
    export let clickable = false;
    function cycleColorsOnClick() {
        if (clickable) {
            console.log("changing key: " + value + " to " + state)
            state = (state + 1) % states.length;
        }
    }
</script>

<!--fixme: css selector should be done with svelte class:$css-class={expr}-->
<button class="button-{state}" on:click={cycleColorsOnClick}>
    {value}
</button>

<style>
    .button-0 {
        appearance: none;
        display: inline-block;
        text-align: center;
        vertical-align: baseline;
        cursor: pointer;
        line-height: 1;
        transform-origin: 50% 50%;
        user-select: none;
        background: rgb(121, 184, 81);
        color: #111;
        border: none;
        border-radius: 2px;
        box-shadow: none;
        flex: 1;
        font-family: sans-serif;
        font-size: 20px;
        font-weight: normal;
        height: 3.5rem;
        width: 3.5rem;
        margin: 0.125rem;
        opacity: 1;
        text-transform: none;
        -webkit-tap-highlight-color: transparent;
    }

    .button-1 {
        appearance: none;
        display: inline-block;
        text-align: center;
        vertical-align: baseline;
        cursor: pointer;
        line-height: 1;
        transform-origin: 50% 50%;
        user-select: none;
        background: #f3c237;
        color: #111;
        border: none;
        border-radius: 2px;
        box-shadow: none;
        flex: 1;
        font-family: sans-serif;
        font-size: 20px;
        font-weight: normal;
        height: 3.5rem;
        width: 3.5rem;
        margin: 0.125rem;
        opacity: 1;
        text-transform: none;
        -webkit-tap-highlight-color: transparent;
    }

    .button-2 {
        appearance: none;
        display: inline-block;
        text-align: center;
        vertical-align: baseline;
        cursor: pointer;
        line-height: 1;
        transform-origin: 50% 50%;
        user-select: none;
        background: #a4aec4;
        color: #111;
        border: none;
        border-radius: 2px;
        box-shadow: none;
        flex: 1;
        font-family: sans-serif;
        font-size: 20px;
        font-weight: normal;
        height: 3.5rem;
        width: 3.5rem;
        margin: 0.125rem;
        opacity: 1;
        text-transform: none;
        -webkit-tap-highlight-color: transparent;
    }
</style>

