<button class:isOn={isOn || on} on:click={() => {
    handleSwitch(true);
    onPress();
}}>
    <slot/>
</button>
{#if keyLabel}
<kbd>{keyLabel}</kbd>
{/if}
<svelte:window on:keydown={keyDown} on:keyup={keyUp} />

<script lang="ts">
    export let key: string = null;
    export let keyLabel: string = key;
    export let on = false;
    export let onSwitch: (active: boolean) => void = () => {};
    export let onPress: () => void = () => {};
    let isOn = false;

    const handleSwitch = (active: boolean) => {
        if(!active) onPress();
        onSwitch(active);
    }

    const keyDown = (e: KeyboardEvent) => {
        if(e.key == key){
            handleSwitch(true);
            isOn = true;
        }
    }
    const keyUp = (e: KeyboardEvent) => {
        if(e.key == key){
            handleSwitch(false);
            isOn = false;
        }
    }
</script>

<style>
    button.isOn {
        background: #bd8b0e;
        color: white;
    }
</style>
