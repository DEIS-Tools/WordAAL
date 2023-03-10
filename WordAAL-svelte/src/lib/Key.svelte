<script>
    export let value = ""
    const states = [0, 1, 2];
    export let state = 0;

    function cycleColorsOnClick() {
        console.log("changing key: " + value + " to " + state)
        state = (state + 1) % states.length;
    }
</script>


<button class="button-{state}" on:click={cycleColorsOnClick}>
    {value}
</button>

<style>
    .button-2 {
        appearance: none;
        display: inline-block;
        text-align: center;
        vertical-align: baseline;
        cursor: pointer;
        line-height: 1;
        transform-origin: 50% 50%;
        user-select: none;
        background: var(--background, #a4aec4);
        color: var(--color, #111);
        border: var(--border, none);
        border-radius: var(--border-radius, 2px);
        box-shadow: var(--box-shadow, none);
        flex: var(--flex, 1);
        font-family: var(--font-family, sans-serif);
        font-size: var(--font-size, 20px);
        font-weight: var(--font-weight, normal);
        height: var(--height, 3.5rem);
        width: 3.5rem;
        margin: var(--margin, 0.125rem);
        opacity: var(--opacity, 1);
        text-transform: var(--text-transform, none);
        -webkit-tap-highlight-color: transparent;
    }

    .button-0 {
        appearance: none;
        display: inline-block;
        text-align: center;
        vertical-align: baseline;
        cursor: pointer;
        line-height: 1;
        transform-origin: 50% 50%;
        user-select: none;
        background: var(--background, rgb(121, 184, 81));
        color: var(--color, #111);
        border: var(--border, none);
        border-radius: var(--border-radius, 2px);
        box-shadow: var(--box-shadow, none);
        flex: var(--flex, 1);
        font-family: var(--font-family, sans-serif);
        font-size: var(--font-size, 20px);
        font-weight: var(--font-weight, normal);
        height: var(--height, 3.5rem);
        width: 3.5rem;
        margin: var(--margin, 0.125rem);
        opacity: var(--opacity, 1);
        text-transform: var(--text-transform, none);
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
        background: var(--background, #f3c237);
        color: var(--color, #111);
        border: var(--border, none);
        border-radius: var(--border-radius, 2px);
        box-shadow: var(--box-shadow, none);
        flex: var(--flex, 1);
        font-family: var(--font-family, sans-serif);
        font-size: var(--font-size, 20px);
        font-weight: var(--font-weight, normal);
        height: var(--height, 3.5rem);
        width: 3.5rem;
        margin: var(--margin, 0.125rem);
        opacity: var(--opacity, 1);
        text-transform: var(--text-transform, none);
        -webkit-tap-highlight-color: transparent;
    }
</style>

