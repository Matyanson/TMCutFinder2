
<script>
    import Navbar from '../components/Navbar.svelte';
</script>

<svelte:head>
    <title>Default Template</title>
</svelte:head>

<Navbar/>

<main>
    <slot></slot>
</main>


<style>
    main{
        width: 100%;
        height: 100%;
        min-height: 100vh;
        padding: 0 100px;

        box-sizing: border-box;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
    }
</style>