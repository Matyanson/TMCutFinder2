<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ fetch }) {
        const subreddit = 'ProgrammingMemes'
        const url = `https://www.reddit.com/r/${subreddit}/random.json?q=site:i.redd%20OR%20site:i.imgur`;
        
        try{
            const res = await fetch(url);

            if (res.status === 200) {
                //get random reddit comment
                const data = await res.json()
                const postData = data[0].data.children[0].data;

                return {
                    props: {
                        postData
                    }
                };
            }
        } catch(e) {
            return { props: {} };
        }

		return { props: {} };
	}
</script>

<script lang="ts">
    
    export let postData = null;
    let imgUrl: string;
    let postUrl: string;

    if(postData){
        //get img
        imgUrl = postData.url_overridden_by_dest ?? postData.url;
                
        //get id of the comment
        const fullname: string = postData.name;
        const id = fullname.split('_')[1];
        postUrl = `https://www.reddit.com/comments/${id}`;
    }
        
</script>
<svelte:head>
	<title>Dynamic content</title>
    <meta name="description" content="Test of loading dynamic data. This data is fetched on server and inserted into HTML. Then send to client.">
    <style>main{background: #5353ff;color: whitesmoke}</style>
</svelte:head>

<h1>Dynamic content bellow</h1>
{#if imgUrl}
    <a href={postUrl} target="blank">
        <img alt="redditImg" src={imgUrl} />
    </a>
{:else}
    <h3 style="height: 70vh">loading ...</h3>
{/if}

<style>
    a img{
        max-width: 100%;
        max-height: 70vh;
    }
</style>