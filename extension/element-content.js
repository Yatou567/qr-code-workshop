var QRElement = {
  extract(el,mode='auto') {
    if(!el || el.isContentEditable || el.closest('input,textarea,select,[contenteditable="true"]')) return {error:'不读取输入框或编辑区域，请选择正文、链接或图片。'};
    const link=el.closest('a[href],area[href]'), image=el.tagName==='IMG'?el:el.querySelector('img');
    const safeURL=value=>{if(typeof value!=='string'||!value.trim())return '';try{const url=new URL(value,el.ownerDocument.baseURI);return ['http:','https:','file:','mailto:','tel:','ftp:'].includes(url.protocol)?url.href:'';}catch{return '';}};
    let url='',source='元素文字';
    if(mode==='link' || (mode==='auto'&&link)){url=link?safeURL(link.getAttribute('href')):'';source='元素链接';}
    else if(mode==='image' || (mode==='auto'&&image)){url=image?safeURL(image.currentSrc||image.src):'';source='图片地址';}
    else {url=(el.innerText||el.textContent||'').trim();}
    return url?{url,source}:{error:'这个元素没有可提取的内容，请换一个元素或提取类型。'};
  }
};
if(typeof module==='object')module.exports=QRElement;
