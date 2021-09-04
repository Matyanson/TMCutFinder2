<div class="container">
    <svg>

    </svg>
    <img alt="screenshot of map" src={$imgSrc}/>
</div>

<script>

import { imgSrc } from "src/store";

</script>

<style>
    .container {
        position: relative;
        height: 100%;
    }
    img{
        display: block;
        height: 100%;
    }
    svg{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; 
        height: 100%;
        overflow: visible;
        z-index: 1;
    }
</style>