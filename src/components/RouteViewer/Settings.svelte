<div class="settings">
    <div class="item">
        number of routes to generate: <input type="number" min="1" bind:value={settings.limit} />
    </div>
    <div class="item">
        max length multiple: <input type="range" bind:value={settings.maxLengthMultiple} min={1} max={5} /> {settings.maxLengthMultiple}
    </div>
    <div class="item">
        insert only if route is shorter: <input type="checkbox" bind:checked={settings.insertOnlyShorter} />
    </div>
</div>
<script lang="ts">
    import type { GenerateSettings } from "src/models/GenerateSettings";

    export let settings: GenerateSettings = {
        limit: 10,
        maxLengthMultiple: 2,
        insertOnlyShorter: true
    }
</script>

<style>
    .settings{
        display: flex;
        flex-flow: column;
    }
</style>