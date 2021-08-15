<div class="editor">
    <div class="tools">
        <Toolbar />
    </div>
    <div class="canvas">
        <Canvas />
    </div>
</div>
<script lang="ts">
import Canvas from "./CanvasPosition.svelte";
import Toolbar from "./Toolbar.svelte";
</script>

<style>
    .editor{
        width: 100%;
        height: 100%;
        display: flex;
        flex-flow: column;
        background: #155053;
    }
    .canvas{
        flex: 1;
    }
</style>