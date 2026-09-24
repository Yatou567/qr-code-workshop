(() => {
  globalThis.__qrPickerCleanup?.();
  const host=document.createElement('div');host.style.cssText='all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;';
  const shadow=host.attachShadow({mode:'closed'});
  shadow.innerHTML=`<style>*{box-sizing:border-box}.mark{position:fixed;border:2px solid #39875a;background:#39875a20;pointer-events:none}.panel{position:fixed;right:18px;top:18px;width:330px;max-height:92vh;overflow:auto;padding:18px;background:#fff;color:#24412e;border:1px solid #bdd0b8;border-radius:16px;box-shadow:0 10px 40px #0003;pointer-events:auto;font:13px/1.5 system-ui,sans-serif}.top{display:flex;justify-content:space-between;align-items:center}button,select,textarea{font:inherit}button{cursor:pointer;padding:9px;border:0;border-radius:7px;background:#e7f0e2;color:#254c30}button:disabled{opacity:.4;cursor:default}select,textarea{width:100%;margin:9px 0;padding:8px;border:1px solid #cddcc5;border-radius:8px}textarea{height:90px;resize:vertical}canvas{display:block;width:230px;height:230px;margin:auto;image-rendering:pixelated}.actions{display:flex;gap:7px;margin-top:10px}.actions button{flex:1}.note{font-size:12px;color:#64775c;margin:8px 0}[hidden]{display:none!important}</style><div class="mark" hidden></div><section class="panel"><div class="top"><strong>选择网页元素</strong><button id="close" aria-label="关闭">✕</button></div><p class="note">移动鼠标查看高亮，点击提取；Esc 退出。不会打开所选链接。</p><select id="mode" aria-label="提取类型"><option value="auto">自动：链接 → 图片地址 → 文字</option><option value="text">只提取文字</option><option value="link">只提取链接</option><option value="image">只提取图片地址</option></select><div id="result" hidden><textarea id="content" aria-label="提取的内容"></textarea><button id="generate">更新二维码</button><canvas id="qr" width="1024" height="1024"></canvas><div class="actions"><button id="copy">复制二维码</button><button id="download">下载 PNG</button><button id="again">重新选择</button></div></div><p id="message" class="note" role="status">历史可在插件的「历史记录」中查看和删除。</p></section>`;
  document.documentElement.append(host);
  const $=id=>shadow.getElementById(id),mark=shadow.querySelector('.mark');let picking=true,valid=false,source='元素文字';
  function inside(e){return e.composedPath().includes(host);}
  function cleanup(){window.removeEventListener('pointermove',move,true);window.removeEventListener('click',click,true);window.removeEventListener('keydown',key,true);host.remove();if(globalThis.__qrPickerCleanup===cleanup)delete globalThis.__qrPickerCleanup;}
  globalThis.__qrPickerCleanup=cleanup;
  function move(e){if(!picking||inside(e)){mark.hidden=true;return;}const el=e.composedPath()[0];if(!el?.getBoundingClientRect)return;const r=el.getBoundingClientRect();mark.hidden=false;mark.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;}
  function key(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();cleanup();}}
  function click(e){if(!picking||inside(e))return;e.preventDefault();e.stopImmediatePropagation();const item=QRElement.extract(e.composedPath()[0],$('mode').value);if(item.error){$('message').textContent=item.error;return;}picking=false;mark.hidden=true;source=item.source;$('result').hidden=false;$('content').value=item.url;generate();}
  function invalidate(){valid=false;$('copy').disabled=$('download').disabled=true;$('qr').hidden=true;}
  async function generate(){
    invalidate();const url=$('content').value;
    if(!url.trim()||new TextEncoder().encode(url).length>2331){$('message').textContent='内容为空或过长，请编辑为 2331 字节以内再生成。';return;}
    try{
      qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];const qr=qrcode(0,'M');qr.addData(url,'Byte');qr.make();const n=qr.getModuleCount(),cell=Math.floor(1024/(n+8)),offset=Math.floor((1024-cell*n)/2),ctx=$('qr').getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,1024,1024);ctx.fillStyle='#000';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))ctx.fillRect(offset+c*cell,offset+r*cell,cell,cell);
      valid=true;$('copy').disabled=$('download').disabled=false;$('qr').hidden=false;
      const result=await chrome.runtime.sendMessage({channel:'qr-history',action:'picked',item:{url,source}});
      $('message').textContent=result?.ok?'已保存到历史。重新打开插件也可查看此内容。':'二维码已生成，但历史保存失败。';
    }catch{$('message').textContent='生成或保存失败，请重新打开插件重试。';}
  }
  $('close').onclick=cleanup;$('again').onclick=()=>{picking=true;$('result').hidden=true;$('message').textContent='请在网页中点选元素。';};$('mode').onchange=()=>{picking=true;};$('content').oninput=()=>{invalidate();$('message').textContent='内容已改变，请点击「更新二维码」。';};$('generate').onclick=generate;
  $('copy').onclick=async()=>{if(!valid)return;try{await QRCopy.image($('qr'));$('message').textContent='二维码图片已复制，可粘贴到聊天或文档。';}catch{$('message').textContent='此网页限制复制图片，请重新打开插件复制，或下载 PNG。';}};
  $('download').onclick=()=>{if(!valid)return;$('qr').toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='二维码.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);},'image/png');};
  window.addEventListener('pointermove',move,true);window.addEventListener('click',click,true);window.addEventListener('keydown',key,true);
})();
