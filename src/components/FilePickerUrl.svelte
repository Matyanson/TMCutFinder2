<script lang="ts">
import FilePicker from "./FilePicker.svelte";

    export let accept = 'image/*';
    export let text = 'Drag and Drop file here';
    export let onChange: (res: string) => void;

    function saveUrl(event: Event){
        const target = event.target as HTMLInputElement;
        let reader = new FileReader();
        reader.onload = () => {
            if(typeof(reader.result) == "string")
                onChange(reader.result);
        }
        reader.readAsDataURL(target.files[0]);
    }
</script>

<FilePicker text={text} accept={accept} onChange={saveUrl} />