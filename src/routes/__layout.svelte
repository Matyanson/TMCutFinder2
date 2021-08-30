
<script>
    import Navbar from '../components/Navbar.svelte';
    import '../global.css';
</script>

<svelte:head>
    <title>TMCutFinder</title>
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

        box-sizing: border-box;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
    }
</style>