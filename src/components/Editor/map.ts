import type { INode } from "src/models/Node";
import type { Path } from "src/models/Path";
import { imgSrc, nodes, paths } from "src/store";
import { base64ToUri, bufferToString, dataUriToBuffer, mergeBuffers, objectToBuffer, splitBuffer } from "src/utils/binary-data";
import { saveFile } from "src/utils/files";

export const saveMap = (name: string, imgUrl: string, paths: Path[], nodes: INode[]) => {
    const data = {
        paths,
        nodes
    }
    const [imgBuffer, mimeType] = dataUriToBuffer(imgUrl);
    const buffers: Uint8Array[] = [
        objectToBuffer(mimeType),
        imgBuffer,
        objectToBuffer(data)
    ]
    const singleBuffer = mergeBuffers(...buffers);
    console.log(singleBuffer.byteLength);
    console.log(mimeType);
    //save to file.
    saveFile(`${name}.dat`, [singleBuffer], 'application/dat');
}

export const loadMap = (blob: Blob | File) => {
    let reader = new FileReader();
    reader.onload = () => {
        if(typeof(reader.result) === 'string') return;
        const buffers = splitBuffer(reader.result);

        const objStrings = buffers.map(b => bufferToString(b));
        const [mimeTypeStr, imgRaw, dataStr] = objStrings;
        const img64 =  btoa(imgRaw);
        const data = JSON.parse(dataStr);
        
        imgSrc.set(base64ToUri(img64, JSON.parse(mimeTypeStr)));
        paths.set(data['paths']);
        nodes.set(data['nodes']);
    }
    reader.readAsArrayBuffer(blob);
}
