<script lang="ts">
    import axios from 'axios';

    function fetchPage(url: string): Promise<string | undefined> {
        const HTMLData = axios
            .get(url)
            .then(res => res.data)
            .catch((error: AxiosError) => {
                console.error(`There was an error with ${error.config.url}.`);
                console.error(error.toJSON());
            });

        return HTMLData;
    }


</script>

<!--Show result of getWordleAnswer-->
<div id="wordle-answer"> {fetchPage("https://word.tips/todays-wordle-answer/")}</div>
