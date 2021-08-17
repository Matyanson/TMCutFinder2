<div class="editor">
    <div class="tools">
        <Toolbar />
    </div>
    <div class="canvas">
        <CanvasTransformer>
            <Canvas />
        </CanvasTransformer>
    </div>
</div>
<script lang="ts">
import Canvas from "./Canvas.svelte";
import CanvasTransformer from "./DisplayTransformer.svelte";
import Toolbar from "./Toolbar.svelte";
</script>

<style>
    .editor{
        width: 100%;
        height: 100%;
        display: flex;
        flex-flow: column;
        background: #155053;
        user-select: none;
        -webkit-user-drag: none;
    }
    .canvas{
        flex: 1;
    }
</style>