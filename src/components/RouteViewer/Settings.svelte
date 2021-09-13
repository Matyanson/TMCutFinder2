<div class="settings">
    <div class="item">
        number of routes to generate: <input type="number" min="1" bind:value={settings.limit} />
    </div>
    <div class="item">
        max length multiple: <input type="range" bind:value={settings.maxLengthMultiple} step="0.5" min={1} max={5} /> {settings.maxLengthMultiple}
    </div>
    <div class="item">
        insert only if route is shorter: <input type="checkbox" bind:checked={settings.insertOnlyShorter} />
    </div>
    <div class="item">
        can respawn from ring: <input type="checkbox" bind:checked={settings.ringRespawn} />
    </div>
    <div class="item">
        can turn around: <input type="checkbox" bind:checked={settings.turnAround} />
    </div>
    <div class="item">
        turn around penalty (additional length units): <input type="number" min="0" bind:value={settings.turnAroundPenalty} />
    </div>
</div>
<script lang="ts">
    import type { GenerateSettings } from "src/models/GenerateSettings";

    export let settings: GenerateSettings = {
        limit: 10,
        maxLengthMultiple: 2,
        insertOnlyShorter: true,
        ringRespawn: true,
        turnAround: true,
        turnAroundPenalty: 0
    }
</script>

<style>
    .settings{
        display: flex;
        flex-flow: column;
    }
</style>