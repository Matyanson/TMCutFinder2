<script context="module">
import Editor from "src/components/Editor/index.svelte";
import { loadMap } from "src/components/Editor/map";
import FilePicker from "src/components/FilePicker.svelte";
    export const prerender = true;
</script>
<script lang="ts">
import ScreenshotSaver from "src/components/ScreenshotSaver.svelte";
import { imgSrc } from "src/store";

const handleFileChange = (file: File) => {
    let reader = new FileReader();
    const nameSplit = file.name.split('.');

    if(file.type.match('image*')){
        reader.readAsDataURL(file);
        reader.onload = () => {
            if(typeof reader.result == 'string')
                handleUrlChange(reader.result);
        }
    } else if(nameSplit[nameSplit.length - 1] == 'dat'){
        loadMap(file);
    }
}
const handleUrlChange = (newUrl) => {
    $imgSrc = newUrl;
}

</script>
<svelte:head>
	<title>Home</title>
    <meta name="description" content="Welcome to TMCutFinder!">
</svelte:head>

{#if $imgSrc == undefined || $imgSrc == ""}
<FilePicker onChange={handleFileChange}/>
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