<div class="settings">
    <div class="item">
        number of routes to generate: <input type="number" bind:value={settings.limit} />
    </div>
    <div class="item">
        max route length: <input type="range" bind:value={settings.maxRouteLength} min={1} max={5} /> {settings.maxRouteLength}
    </div>
</div>
<script lang="ts">
    export let settings = {
        limit: 10,
        maxRouteLength: 2
    }
</script>

<style>
    .settings{
        display: flex;
        flex-flow: column;
    }
</style>