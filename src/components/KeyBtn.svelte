<div class="key-container" class:active={isOn || on} on:click={() => {
    handleSwitch(true);
    onPress();
}}>
    <button>
        {#if keyLabel}
        {keyLabel}
        {/if}
    </button>
    <div class="label"><slot/></div>
</div>
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
    .key-container {
        position: relative;
	    transition: all .2s cubic-bezier(0, 0, 0, 1);
    }

    .key-container button {
        position: relative;
        width: 100%;
        background: grey;
        color: whitesmoke;
        border: none;
        font-size: 1.7rem;
	    transition: all .2s cubic-bezier(0, 0, 0, 1);
    }

    .label {
        font-family: sans-serif;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
        /*1/2 * 1.5rem * tan15°*/
        font-size: 1rem;
        height: 1.5rem;
        width: 100%;
        overflow: hidden;
        color: whitesmoke;
        background: #444;
        transform-origin: top;
        transform: skewX(15deg);
        transition: all .2s cubic-bezier(0, 0, 0, 1);;
    }
    button::before {
        content: '';
        position: absolute;
        top: 0;
        right: -0.4rem;
        width: 0.4rem;
        height: 100%;
        background: #333;
        transform-origin: top left;
        transform: skewY(75deg);
        transition: all .2s cubic-bezier(0, 0, 0, 1);
    }
    .key-container.active {
        transform: translate(0.4rem, 1.5rem);
    }
    .key-container.active button {
        background: #bd8b0e;
        color: white;
    }
    .key-container.active button::before {
        transform: skewY(75deg) scaleX(0);
    }
    .key-container.active .label {
        transform: skewX(15deg) scaleY(0);
    }
</style>
