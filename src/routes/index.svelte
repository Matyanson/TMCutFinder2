<script context="module">
import Canvas from "src/components/Editor/Canvas.svelte";
    export const prerender = true;
</script>
<script lang="ts">
</script>
<svelte:head>
	<title>Home</title>
    <meta name="description" content="Welcome to TMCutFinder!">
</svelte:head>

<h1>CutFinder</h1>

<div class="wrap">
    <Canvas/>
</div>

<style>
    .wrap{
        height: 500px;
        width: 900px;
        resize: both;
        overflow: hidden;
        border: 2px solid crimson;
    }
</style>