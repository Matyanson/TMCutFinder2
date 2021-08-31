<script lang="ts">
import FilePicker from "./FilePicker.svelte";

    export let accept = 'image/*';
    export let text: string = undefined;
    export let onChange: (res: string) => void;

    function saveUrl(file: File){
        let reader = new FileReader();
        reader.onload = () => {
            if(typeof(reader.result) == "string")
                onChange(reader.result);
        }
        reader.readAsDataURL(file);
    }
</script>

<FilePicker bind:text accept={accept} onChange={saveUrl} />