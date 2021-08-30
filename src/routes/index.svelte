<script context="module">
import Editor from "src/components/Editor/index.svelte";
    export const prerender = true;
</script>
<script lang="ts">
import FilePickerUrl from "src/components/filePickerUrl.svelte";
import ScreenshotSaver from "src/components/ScreenshotSaver.svelte";
import { imgSrc } from "src/store";

const handleUrlChange = (url: string) => {
    imgSrc.set(url);
}

</script>
<svelte:head>
	<title>Home</title>
    <meta name="description" content="Welcome to TMCutFinder!">
</svelte:head>

{#if $imgSrc == undefined || $imgSrc == ""}
<FilePickerUrl onChange={handleUrlChange}/>
<ScreenshotSaver onChange={handleUrlChange}/>
<h2>Or paste a screenshot from clipboard!</h2>
{:else}
<div class="box">
    <Editor />
</div>
{/if}


<style>
    .box{
        overflow: hidden;
        width: 100%;
        height: 100vh;

        z-index: 10;
    }
</style>