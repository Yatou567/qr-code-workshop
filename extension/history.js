/* Shared, bounded local history model. No HTML is evaluated. */
var QRHistory = (() => {
  const limit = 100;
  function clean(items) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter(x => {
      if (!x || typeof x.url !== 'string' || !x.url.trim() || x.url.length > 12000 || seen.has(x.url)) return false;
      seen.add(x.url); return true;
    }).slice(0,limit).map(x=>({url:x.url,source:typeof x.source==='string'?x.source.slice(0,80):'历史记录',time:Number(x.time)||0}));
  }
  function add(items,item,time=Date.now()) {
    if(!item || typeof item.url!=='string' || !item.url.trim() || item.url.length>12000) return clean(items);
    return clean([{url:item.url,source:item.source,time},...clean(items).filter(x=>x.url!==item.url)]);
  }
  return {limit,clean,add,remove:(items,url)=>clean(items).filter(x=>x.url!==url)};
})();
if(typeof module==='object') module.exports=QRHistory;
