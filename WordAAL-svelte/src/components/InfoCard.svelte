<script lang="ts">
    import Card from "@smui/card";
    import {Actions, Content} from "@smui/dialog";
    import Button from "@smui/button";
    import {Label} from "@smui/snackbar";

    export let text: string = "InfoCard content";
    export let show: boolean = true;

    let close = () => {
        show = false;
        document.cookie = "wordaalWelcomeCardShow=0; SameSite=Lax; expires=Thu, 01 Jan 9999 00:00:00 UTC; path=/";
    }

</script>
{#if show}
    <div class="infocard">
        <Card variant="outlined" padded>
            <Content>{@html text}</Content>
            <Actions>
                <Button on:click={() => {}}>
                    <Label><a href='https://github.com/DEIS-Tools/WordAAL/issues' target=”_blank”> GitHub issues </a></Label>
                </Button>
                <Button on:click={() => {}}>
                    <Label><a href='mailto:falkeboc@cs.aau.dk' target=”_blank”>falkeboc@cs.aau.dk</a></Label>
                </Button>
                <Button on:click={() => {close()}}>
                    <Label><i class="material-icons" aria-hidden="true">close</i></Label>
                </Button>
            </Actions>
        </Card>
    </div>
{/if}

<style>
    .infocard {
        scale: 90%;
        position: fixed;
        bottom: 0;
        right: 0;
        width: auto;
        height: auto;
    }
</style>
