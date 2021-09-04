//handle different commands
onmessage = async function(e){
    let d = e.data;
    switch(d.type){
        case "hello":
        console.log("world");
        this.postMessage({type: "hello", data: "hello world"});
        break;
        default:
        console.log("undefined command");
        break;
    }
}
export {};