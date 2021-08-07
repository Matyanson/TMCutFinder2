<script context="module">
    export const prerender = true;
</script>

<script lang="ts">
    let m = {X:0, Y:0};

    const handleMousemove = (e: MouseEvent) => {
        m.X = e.clientX;
        m.Y = e.clientY;
    }
</script>
<svelte:head>
    <title>Interactive content</title>
    <meta name="description" content="Test of loading interactive content, rendered by JS at runtime.">
    <style>main{background: #ff9430;color: whitesmoke}</style>
</svelte:head>

<h1>Interactive content bellow</h1>
<h2>{`${m.X} : ${m.Y}`}</h2>

<svelte:window on:mousemove={handleMousemove}/>