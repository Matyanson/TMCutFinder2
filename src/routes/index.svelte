<script context="module">
import Editor from "src/components/Editor/index.svelte";
    export const prerender = true;
</script>
<script lang="ts">
import FilePickerUrl from "src/components/FilePickerUrl.svelte";
import { imgSrc } from "src/store";

let fileUrl;

$: if(typeof(fileUrl) == 'string') imgSrc.set(fileUrl);

</script>
<svelte:head>
	<title>Home</title>
    <meta name="description" content="Welcome to TMCutFinder!">
</svelte:head>

{#if $imgSrc == undefined || $imgSrc == ""}
<FilePickerUrl bind:url={fileUrl}/>
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