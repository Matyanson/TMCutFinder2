<script lang="ts">
    export let accept = '';
    export let multiple = false;
    export let text = 'Drag and Drop file here';
    export let onChange: (e: Event) => void = () => {};
    let draging = false;
</script>

<span class={`dragBox ${draging? "draging": ""}`} >
    {text}
    <input type="file" accept={accept} multiple={multiple} on:dragstart={()=>{draging = true}} on:dragleave={()=>{draging = false}} on:change={onChange} />
</span>

<style>
.dragBox {
    width: 250px;
    height: 100px;
    margin: 0 auto;
    position: relative;
    text-align: center;
    font-weight: bold;
    line-height: 95px;
    color: #999;
    border: 2px dashed #ccc;
    background: #fff;
    display: inline-block;
    transition: 0.1s;
}
.dragBox:hover{
    border-color: #3485c7;
}
.draging{
    transform: scale(1.1);
}
input[type="file"] {
    position: absolute;
    height: 100%;
    width: 100%;    
    opacity: 0;
    top: 0;
    left: 0;
}
</style>