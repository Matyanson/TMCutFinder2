<div class:selected class="route" on:click>
    <div class="dist">{Math.floor(route.dist)}</div>
    <div class="cps">
        {#each route.cps as cp}
            <div>{cp.num}</div>
        {/each}
    </div>
</div>

<script lang="ts">
    import type { Route } from "src/models/Route";
    export let route: Route;
    export let selected: boolean;

</script>

<style>
    .route{
        background: #0f5f8d;
        color: #fff;
        padding: 5px;
        margin: 2px;
        border-radius: 3px;
    }
    .route.selected{
        background: #3b9bd3;
        color: #000;
    }
    .cps{
        display: flex;
        flex-flow: row;
    }
</style>