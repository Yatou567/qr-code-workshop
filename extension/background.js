importScripts('history.js');
let queue=Promise.resolve();
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
  if(sender.id!==chrome.runtime.id || msg?.channel!=='qr-history') return;
  queue=queue.then(async()=>{
    const data=await chrome.storage.local.get(['history','pending']);
    let history=QRHistory.clean(data.history), pending=data.pending||null;
    switch(msg.action){
      case 'list': break;
      case 'add': history=QRHistory.add(history,msg.item);break;
      case 'picked': history=QRHistory.add(history,msg.item);pending=history.find(x=>x.url===msg.item?.url)||null;break;
      case 'remove': history=QRHistory.remove(history,msg.url);if(pending?.url===msg.url)pending=null;break;
      case 'clear': history=[];pending=null;break;
      case 'consume': pending=null;break;
      default: throw Error('Unsupported history action');
    }
    if(msg.action!=='list')await chrome.storage.local.set({history,pending});
    reply({ok:true,history,pending});
  }).catch(()=>reply({ok:false,error:'历史记录无法保存，请检查浏览器存储。'}));
  return true;
});
