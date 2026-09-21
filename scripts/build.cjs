'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(buf){let c=0xffffffff;for(const b of buf)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.name.startsWith('.')?[]:[path.join(dir,e.name)]);}
let offset=0;const chunks=[],central=[];
for(const file of files(path.join(root,'extension'))){
 const name=Buffer.from(path.relative(root,file).split(path.sep).join('/')),data=fs.readFileSync(file),compressed=zlib.deflateRawSync(data),crc=crc32(data);
 const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(0x21,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(0x21,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);
 chunks.push(h,name,compressed);central.push(c,name);offset+=h.length+name.length+compressed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(central.length/2,8);end.writeUInt16LE(central.length/2,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
fs.writeFileSync(path.join(out,'qr-code-workshop-chrome.zip'),Buffer.concat([...chunks,directory,end]));
fs.copyFileSync(path.join(root,'docs/index.html'),path.join(out,'qr-code-workshop-offline.html'));
const names=['qr-code-workshop-chrome.zip','qr-code-workshop-offline.html'];
fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),names.map(n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(out,n))).digest('hex')+'  '+n).join('\n')+'\n');
console.log('Created dist/: '+[...names,'SHA256SUMS.txt'].join(', '));
