<script>
    import {profileData} from '../store';
</script>

<nav>
	<a href=".">Home</a>
	<a href="staticData">Static</a>
    <a href="interactiveData">Interactive</a>
    <a href="profileData">User</a>
	<a href="dynamicData">Dynamic</a>
    {#if $profileData}
        <img alt="user avatar" src={$profileData.imgSrc}/>
        {$profileData.username}
    {/if}
</nav>

<style>
    nav{
        position: fixed;
    }
    nav img{
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
    }
</style>