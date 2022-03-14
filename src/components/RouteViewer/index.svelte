<div class="generator">
    <div class="settings">
        <Generator />
        <KeyBtn key=' ' on={$toolIndex == 3} onSwitch={switchCamera} keyLabel='space'>Camera</KeyBtn>
    </div>
    <div class="display">
        <Replay />
    </div>
</div>

<script lang="ts">
    import { toolIndex } from "src/store";
    import KeyBtn from "src/components/KeyBtn.svelte";
    import Generator from "./Generator.svelte";
    import Replay from "./Replay.svelte";
    import { setContext } from "svelte";
    import type ReplayContext from "./ReplayContext";
    import { writable } from "svelte/store";


    setContext("replay",
        writable({
            activeRoute: { dist: 0, points: [], cps: [] },
            incomplete: true
    }) as ReplayContext);

    let percentage = 0;

const switchCamera = (active: boolean) => {
    if(active){
        $toolIndex = 3;
    } else {
        $toolIndex = 0;
    }
}
</script>
<style>
    .generator{
        width: 100%;
        height: 100%;
    }
    .settings{
        padding: 10px;
        background: #ececec;
    }
    .display{
        position: relative;
        width: 100%;
        height: 100%;
        resize: horizontal;
    }
</style>