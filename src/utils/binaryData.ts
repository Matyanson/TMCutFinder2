//https://hacks.mozilla.org/2017/01/typedarray-or-dataview-understanding-byte-order/


export const mergeBuffers = (...buffers: Uint8Array[]) => {
    //https://stackoverflow.com/questions/38961399/javascript-download-multiple-files-and-concatenate-into-a-single-file
    const lengths = buffers.map(b => b.byteLength);
    const totalLength = lengths.reduce((total, curr) => total + curr);
    const reservedBytesForLengths = lengths.length * 4;         //numbers are saved in 32bit, 32 / 8 = 4bytes. each number occupies 4 8bit bytes.
    const res = new ArrayBuffer(reservedBytesForLengths + totalLength);
    const uint32View = new Uint32Array(res, 0, lengths.length);          //maximum of 4.2bg can be strored per buffer
    const uint8View = new Uint8Array(res);

    uint32View.set(lengths, 0);
    let lastDataEnd = reservedBytesForLengths;
    for(let i = 0; i < buffers.length; i++) {
        uint8View.set(buffers[i], lastDataEnd);
        lastDataEnd += lengths[i];
    }
    return res;
}

export const splitBuffer = (buffer: ArrayBuffer, bufferCount: number) => {
    const uint8View = new Uint8Array(buffer, bufferCount * 4);       //32bit => 8bit == *4
    const uint32View = new Uint32Array(buffer, 0, bufferCount);      //3 numbers stored in 3 bytes (32bit)
    const lengths = Array.from(uint32View);
    
    const buffers: Uint8Array[] = [];
    [0, ...lengths].reduce((total, cur) => {
        const next = total + cur;
        buffers.push(uint8View.subarray(total, next));
        return next;
    })
    return buffers;
}

export const objectToBuffer = (obj: Object) => {
    const objString = JSON.stringify(obj);
    return stringToBuffer(objString);
}

export const dataUriToBuffer = (dataURI: string): [Uint8Array, string] => {
    //https://stackoverflow.com/questions/12168909/blob-from-dataurl
    //https://www.codegrepper.com/code-examples/javascript/how+to+convert+data+uri+in+array+buffer
    //https://www.npmjs.com/package/data-uri-to-buffer
    const splitUrl = dataURI.split(',');
    const mimeString = splitUrl[0].split(':')[1].split(';')[0];
    const dataFormat = splitUrl[0].split(';')[1];

    const buffer = base64ToBuffer(splitUrl[1]);
    return [buffer, mimeString];
}

export const base64ToUri = (base64: string, mimeType: string) => {
    return `data:${mimeType};base64,${base64}`;
}

export const base64ToBuffer = (data64: string) => {
    const decoded = atob(data64);
    return stringToBuffer(decoded);
}

export const stringToBuffer = (s: string) => {
    const arr: number[] = [];
    for (let i = 0; i < s.length; i++) {
        arr.push(s.charCodeAt(i));        
    }
    const arrBuffer = new Uint8Array(arr);
    return arrBuffer;
}

export const bufferToString = (buffer: Uint8Array): string => {
    return String.fromCharCode(...Array.from(buffer));
}