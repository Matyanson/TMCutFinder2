<div >
    <div class="tools">
        <button class:on={$toolIndex == 0} on:click={()=>setTool(0)}>Select</button><kbd>q</kbd>
        <button class:on={$toolIndex == 1} on:click={()=>setTool(1)}>Path</button><kbd>w</kbd>
        <button class:on={$toolIndex == 2} on:click={()=>setTool(2)}>Node</button><kbd>e</kbd>
        <button class:on={$toolIndex == 3} on:click={()=>setTool(3)}>Camera</button><kbd>space</kbd>
    </div>
    <div class="options">

    </div>
</div>
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<script lang="ts">
    import { toolIndex } from 'src/store'
    let lastTool = 0;
    
    const setTool = (n: number) => {
        $toolIndex = n;
    }

    const onKeyDown = (e: KeyboardEvent) => {
        switch(e.key){
            case 'q':
                $toolIndex = 0;
                break;
            case 'w':
                $toolIndex = 1;
                break;
            case 'e':
                $toolIndex = 2;
                break;
            case ' ':
                if($toolIndex != 3) lastTool = $toolIndex;
                $toolIndex = 3;
            break;

        }
    }
    const onKeyUp = (e: KeyboardEvent) => {
        switch(e.key){
            case ' ':
                $toolIndex = lastTool;
                break;
        }
    }
</script>

<style>
    .tools{
        padding: 10px;
    }
    .tools button.on {
        background: #bd8b0e;
        color: white;
    }
</style>