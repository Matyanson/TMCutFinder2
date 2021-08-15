<script context="module">
import Editor from "src/components/Editor/index.svelte";
    export const prerender = true;
</script>
<script lang="ts">
</script>
<svelte:head>
	<title>Home</title>
    <meta name="description" content="Welcome to TMCutFinder!">
</svelte:head>

<div class="box">
    <Editor />
</div>

<style>
    .box{
        overflow: hidden;
        width: 100%;
        height: 100vh;

        z-index: 10;
    }
</style>