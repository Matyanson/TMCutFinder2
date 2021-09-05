<div class="generator">
    <div class="settings">
        <Generator bind:route bind:percentage />
        <KeyBtn key=' ' on={$toolIndex == 3} onSwitch={switchCamera} keyLabel='space'>Camera</KeyBtn>
    </div>
    <div class="display">
        <DisplayTransformer>
            <Display bind:route bind:percentage/>
        </DisplayTransformer>
    </div>
</div>

<script lang="ts">
    import Display from "./Display.svelte";
    import DisplayTransformer from "../Editor/DisplayTransformer.svelte";
    import { toolIndex } from "src/store";
    import KeyBtn from "src/components/KeyBtn.svelte";
    import Generator from "./Generator.svelte";

    let route = {dist:0, points: [], cps: []};
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