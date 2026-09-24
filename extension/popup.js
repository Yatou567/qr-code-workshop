'use strict';
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
const $ = id => document.getElementById(id);
let page = {url:'',title:'',links:[]}, pinned = null, active = null, qr = null, timer;
let interaction = 0, loadSequence = 0;
function render(item) {
  active = item; qr = null;
  $('copy').disabled = $('png').disabled = $('svg').disabled = true;
  $('canvas').hidden = true; $('placeholder').hidden = false;
  $('error').textContent = ''; $('state').textContent = '等待输入';
  $('source').textContent = item?.source || '自定义内容';
  $('payload').textContent = item?.url || '';
  if (!item?.url) return;
  if (new TextEncoder().encode(item.url).length > 2331) { $('error').textContent = '内容过长，请缩短到 2331 字节以内。'; $('state').textContent = '无法生成'; return; }
  try {
    const code = qrcode(0,'M'); code.addData(item.url,'Byte'); code.make();
    const n = code.getModuleCount(), canvas = $('canvas'), ctx = canvas.getContext('2d');
    const cell = Math.floor(1024/(n+8)), offset = Math.floor((1024-n*cell)/2);
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,1024,1024); ctx.fillStyle = '#000';
    for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(code.isDark(r,c)) ctx.fillRect(offset+c*cell,offset+r*cell,cell,cell);
    qr = code; $('canvas').hidden = false; $('placeholder').hidden = true;
    $('copy').disabled = $('png').disabled = $('svg').disabled = false; $('state').textContent = '可扫码';
  } catch { $('error').textContent = '内容超出二维码容量，请缩短后重试。'; $('state').textContent = '无法生成'; }
}
function choose(item) { clearTimeout(timer); clearTimeout(historyTimer); interaction++; pinned=item; render(item); remember(item); }
function preview(item) { clearTimeout(timer); clearTimeout(historyTimer); interaction++; render(item); historyTimer=setTimeout(()=>remember(item),700); }
function wire(button,item) {
  button.addEventListener('mouseenter',()=>preview(item));
  button.addEventListener('focus',()=>preview(item));
  button.addEventListener('mouseleave',()=>{clearTimeout(historyTimer);render(pinned);});
  button.addEventListener('blur',()=>{clearTimeout(historyTimer);render(pinned);});
  button.addEventListener('click',()=>{choose(item);document.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));button.classList.add('selected');});
}
function showLinks() {
  const query = $('search').value.toLocaleLowerCase();
  const matches = page.links.filter(x=>(x.title+' '+x.url).toLocaleLowerCase().includes(query));
  $('total').textContent = page.links.length; $('shown').textContent = matches.length + ' 条';
  const fragment = document.createDocumentFragment();
  // Render all matches so every extracted link is available via scrolling/search.
  for (const item of matches) {
    const button = document.createElement('button'); button.className='link'; button.title=item.url;
    const title=document.createElement('strong'), url=document.createElement('span');
    title.textContent=item.title;url.textContent=item.url;button.append(title,url);
    wire(button,{...item,source:'页面链接'});fragment.append(button);
  }
  if (!matches.length) {const empty=document.createElement('p');empty.textContent=query?'没有匹配的链接。':'暂未发现链接。页面加载完成后可点击刷新。';empty.style.color='#889580';fragment.append(empty);}
  $('list').replaceChildren(fragment);
}
async function loadPage() {
  const seq = ++loadSequence, before=interaction;
  $('refresh').disabled=true; $('notice').textContent='正在读取当前网页…';
  let warning='';
  try {
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id) throw new Error('没有可用的网页');
    let next={url:tab.url||'',title:tab.title||'当前网页',links:[]};
    try {
      const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:extractPageLinks});
      if(results[0]?.result) next=results[0].result;
    } catch { warning='此页面限制读取链接（如 Chrome 内部页面或扩展商店）。仍可使用当前网址或手动输入；本地文件需开启“允许访问文件网址”。'; }
    if(seq!==loadSequence)return;
    page=next;
    $('page-title').textContent=page.title||'当前网页';$('page-url').textContent=page.url||'未提供网址';
    $('current').disabled=!page.url;
    if(before===interaction) {pinned={url:page.url,source:'当前网页'};render(pinned);remember(pinned);}
    $('notice').textContent=warning||(page.truncated?'链接较多，已读取前 5000 条。':'');showLinks();
  } catch { $('notice').textContent='无法读取当前网页，请直接在左侧输入网址或文字。';$('page-title').textContent='无法读取网页';$('current').disabled=true; }
  finally {if(seq===loadSequence)$('refresh').disabled=false;}
}
function save(blob,ext) {
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='二维码.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
$('current').addEventListener('mouseenter',()=>preview({url:page.url,source:'当前网页'}));
$('current').addEventListener('focus',()=>preview({url:page.url,source:'当前网页'}));
$('current').addEventListener('mouseleave',()=>{clearTimeout(historyTimer);render(pinned);});
$('current').addEventListener('blur',()=>{clearTimeout(historyTimer);render(pinned);});
$('current').addEventListener('click',()=>{choose({url:page.url,source:'当前网页'});document.querySelectorAll('.selected').forEach(e=>e.classList.remove('selected'));});
$('input').addEventListener('input',()=>{
  clearTimeout(timer);clearTimeout(historyTimer);interaction++;
  const item={url:$('input').value,source:'自定义内容'};pinned=item;
  $('bytes').textContent=new TextEncoder().encode(item.url).length+' 字节';
  render(null); timer=setTimeout(()=>{render(item);historyTimer=setTimeout(()=>remember(item),700);},120);
});
$('input').addEventListener('focus',()=>{if($('input').value)choose({url:$('input').value,source:'自定义内容'});});
$('search').addEventListener('input',showLinks);$('refresh').addEventListener('click',loadPage);
$('png').addEventListener('click',()=>{if(qr)$('canvas').toBlob(blob=>{if(blob)save(blob,'png');},'image/png');});
$('svg').addEventListener('click',()=>{if(qr)save(new Blob([qr.createSvgTag({cellSize:12,margin:48,scalable:true})],{type:'image/svg+xml;charset=utf-8'}),'svg');});
let historyTimer, historyItems=[];
async function historyRequest(action,extra={}) {
  const result=await chrome.runtime.sendMessage({channel:'qr-history',action,...extra});
  if(!result?.ok)throw Error(result?.error||'历史记录暂时不可用');
  historyItems=result.history;showHistory();return result;
}
function remember(item){if(!qr||active?.url!==item?.url)return;historyRequest('add',{item}).catch(e=>$('history-status').textContent=e.message);}
function showHistory(){
  const list=document.createDocumentFragment(),query=$('history-search').value.toLowerCase();
  for(const item of historyItems.filter(x=>x.url.toLowerCase().includes(query))){
    const row=document.createElement('div');row.className='history-row';
    const button=document.createElement('button');button.className='link';button.title=item.url;
    const title=document.createElement('strong'),date=document.createElement('span');title.textContent=item.url;date.textContent=item.source+' · '+new Date(item.time).toLocaleString();button.append(title,date);
    button.addEventListener('click',()=>{clearTimeout(timer);clearTimeout(historyTimer);interaction++;pinned=item;$('input').value=item.url;render(item);});
    const remove=document.createElement('button');remove.className='delete';remove.textContent='删除';remove.addEventListener('click',()=>{clearTimeout(historyTimer);historyRequest('remove',{url:item.url}).catch(e=>$('history-status').textContent=e.message);});row.append(button,remove);list.append(row);
  }
  if(!list.children.length){const empty=document.createElement('p');empty.textContent='暂无历史记录';list.append(empty);}
  $('history-list').replaceChildren(list);
}
$('copy').addEventListener('click',async()=>{if(!qr)return;remember(active);try{await QRCopy.image($('canvas'));$('state').textContent='图片已复制';}catch{$('error').textContent='复制图片失败，请允许剪贴板权限或下载 PNG。';}});
$('history-tab').addEventListener('click',()=>{$('links-pane').hidden=true;$('history-pane').hidden=false;historyRequest('list').catch(e=>$('history-status').textContent=e.message);});
$('links-tab').addEventListener('click',()=>{$('links-pane').hidden=false;$('history-pane').hidden=true;});
$('history-search').addEventListener('input',showHistory);
$('clear-history').addEventListener('click',()=>{if(!confirm('清空所有本地二维码历史？'))return;clearTimeout(historyTimer);historyRequest('clear').catch(e=>$('history-status').textContent=e.message);});
$('pick').addEventListener('click',async()=>{
  try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});await chrome.scripting.executeScript({target:{tabId:tab.id},files:['qrcode.js','clipboard.js','element-content.js','picker.js']});window.close();}
  catch{$('history-status').textContent='此页面不能选取元素，请在普通网页使用；本地文件需允许文件网址访问。';}
});
async function start(){
  const before=interaction;
  try{const data=await historyRequest('list');if(data.pending&&before===interaction){choose(data.pending);await historyRequest('consume');}}catch(e){$('history-status').textContent=e.message;}
  if(before!==interaction){const loading=loadPage();interaction++;await loading;}else await loadPage();
}
render(null);start();
