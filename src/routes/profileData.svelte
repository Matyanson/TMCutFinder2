<script context="module">
    export const prerender = true;
</script>

<script lang="ts">
    import { profileData } from "../store";
    
    let name: string;
    let password: string;

    const rand = () => {
        return Math.random().toString(36).substr(2);
    };

    const getToken = (length: number) => {
        return Array(Math.floor(length / 10) + 1).fill(rand()).join('').substr(0, length);
    };

    const getProfileData = () => {
        return {
            username: name == '' ? 'Anonymous' : name ,
            imgSrc: `avatars/${Math.floor(Math.random() * 8) + 1}.png`
        }
    }

    const login = () => {
        //server verifies login and returns acces token
        const token = getToken(32);
        //token is stored in browser
        document.cookie = `token=${token}`;
        //profile data is requested and stored in browser
        $profileData = getProfileData();
    }

    const logout = () => {
        //clear token and profile data
        $profileData = null;
        document.cookie = '';
    }
</script>
<svelte:head>
    <title>User content</title>
    <meta name="description" content="Test of loading profile data. profile data like avatar or username is saved in localStorage for later use and faster load.">
    <style>main{background: #00c975;color: whitesmoke}</style>
</svelte:head>
    
<h1>Profile content bellow</h1>
<div class="container">
{#if $profileData == null}
    <label>
        <b>Username</b>
        <input type="text" placeholder="Enter Username" bind:value={name}>
    </label>
    <label>
        <b>Password</b>
        <input type="password" placeholder="Enter Password" bind:value={password}>
    </label>      
    <button on:click={login}>Login</button>
{:else}
    <img alt="user avatar" src={$profileData.imgSrc}/>
    <h2>{$profileData.username}</h2>
    <button on:click={logout}>Logout</button>
{/if}
</div>

<style>
    .container{
        display: flex;
        flex-flow: column;
        align-items: center;
    }
    .container img{
        width: 200px;
        border-radius: 50%;
        overflow: hidden;
    }
</style>