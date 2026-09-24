var QRCopy = {
  async image(canvas) {
    if(!globalThis.ClipboardItem || !navigator.clipboard?.write) throw Error('当前环境不支持复制图片，请下载 PNG，或使用 HTTPS 网页 / Chrome 插件。');
    // Pass a promise to ClipboardItem before losing the user activation.
    const blob = new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('图片生成失败')),'image/png'));
    await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
  }
};
