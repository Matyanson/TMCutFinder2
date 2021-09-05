<div class="container">
    <div class="toolbar">
        <input type='range' min='0' max='10000' bind:value={percentage} /> {percentage / 100}
    </div>
    <div class="display">
        <DisplayTransformer>
            <Display bind:route bind:percentage />
        </DisplayTransformer>
    </div>
</div>

<script lang="ts">
    import type { Route } from "src/models/Route";
    import DisplayTransformer from "../Editor/DisplayTransformer.svelte";
    import Display from "./Display.svelte";

    export let route: Route;
    let percentage = 0;
</script>

<style>
.container{
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: column;
}
.toolbar{
    background: #fff;
}
.toolbar input{
    margin: 0;
    width: 100%;
}
.display{
    flex: 1;
}
</style>