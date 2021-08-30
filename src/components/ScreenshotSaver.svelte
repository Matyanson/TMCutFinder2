<script lang="ts">
import { onMount } from "svelte";



    export let onChange: (res: string) => void;

    onMount(() => {
        document.addEventListener('paste', handlePaste);
    })

    const handlePaste = (e: ClipboardEvent) => {
        let item = e.clipboardData.items[0];

        if (item.type.indexOf("image") === 0){
            let blob = item.getAsFile();
    
            let reader = new FileReader();
            reader.onload = (e) => {
                if(typeof(reader.result) == 'string')
                    onChange(reader.result);
            };
    
            reader.readAsDataURL(blob);
        }
    }
</script>