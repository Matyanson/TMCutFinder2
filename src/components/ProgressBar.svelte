<div class="wrap">
    <div class="message">{Math.floor(progress * 10) / 10}</div>
    <div class="bar" style={`width: ${progress}%`}></div>
</div>

<script lang="ts">
    export let progress: number = 10;

</script>

<style>
    .wrap{
        position: relative;
        width: 100%;
        height: 20px;
        background: #6c82ff;
        color: #fff;
    }
    .message{
        position: absolute;
        top:50%;
        left:50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }
    .bar{
        height: 100%;
        background: #1b36ca;
    }
</style>