import type { McpAppRecord } from './mcp-app.repository';

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function renderMcpAppView(app: McpAppRecord): string {
  const config = safeJson({
    name: app.name,
    toolName: app.toolName,
    viewType: app.viewType,
    ...app.viewConfig,
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Arthur MCP App</title>
  <style>
    :root{color-scheme:light dark;font-family:var(--font-sans,Inter,system-ui,sans-serif);background:var(--color-background-primary,#fff);color:var(--color-text-primary,#17202a)}
    *{box-sizing:border-box}body{margin:0;padding:16px;background:transparent}.header{display:flex;align-items:center;gap:12px;margin-bottom:14px}.header h1{font-size:16px;margin:0;flex:1}.status{font-size:12px;color:var(--color-text-secondary,#667085)}button{border:1px solid var(--color-border-primary,#d0d5dd);background:var(--color-background-secondary,#f8fafc);color:inherit;border-radius:7px;padding:7px 11px;cursor:pointer}button:disabled{opacity:.55;cursor:default}.empty,.error{padding:20px;border:1px dashed var(--color-border-secondary,#d0d5dd);border-radius:9px;text-align:center;color:var(--color-text-secondary,#667085)}.error{color:var(--color-text-danger,#b42318)}.table-wrap{overflow:auto;border:1px solid var(--color-border-primary,#e4e7ec);border-radius:9px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:9px 11px;border-bottom:1px solid var(--color-border-secondary,#eaecf0);vertical-align:top}th{font-weight:650;background:var(--color-background-secondary,#f8fafc);position:sticky;top:0}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.card,.details{border:1px solid var(--color-border-primary,#e4e7ec);border-radius:9px;padding:13px;background:var(--color-background-secondary,#fff)}.card h2{font-size:14px;margin:0 0 4px}.card p{font-size:12px;color:var(--color-text-secondary,#667085);margin:0 0 10px}.field{display:grid;grid-template-columns:minmax(100px,32%) 1fr;gap:10px;padding:6px 0;border-bottom:1px solid var(--color-border-secondary,#eaecf0);font-size:12px}.field:last-child{border-bottom:0}.field strong{overflow-wrap:anywhere}.field span{overflow-wrap:anywhere;white-space:pre-wrap}pre{margin:0;overflow:auto;padding:14px;border-radius:9px;background:var(--color-background-secondary,#f8fafc);font:12px/1.5 var(--font-mono,ui-monospace,monospace)}
  </style>
</head>
<body>
  <div class="header"><h1 id="title"></h1><span class="status" id="status">Connecting…</span><button id="refresh" type="button" disabled>Refresh</button></div>
  <main id="content"><div class="empty">Waiting for the tool result…</div></main>
  <script>
    (function(){
      'use strict';
      var config=${config};
      var protocolVersion='2026-01-26';
      var nextId=1;
      var pending=new Map();
      var lastArguments={};
      var title=document.getElementById('title');
      var status=document.getElementById('status');
      var content=document.getElementById('content');
      var refresh=document.getElementById('refresh');
      title.textContent=config.name;

      function send(message){window.parent.postMessage(message,'*')}
      function notify(method,params){send({jsonrpc:'2.0',method:method,params:params||{}})}
      function request(method,params){
        var id=nextId++;
        send({jsonrpc:'2.0',id:id,method:method,params:params||{}});
        return new Promise(function(resolve,reject){
          pending.set(id,{resolve:resolve,reject:reject});
          setTimeout(function(){if(pending.has(id)){pending.delete(id);reject(new Error('Host request timed out'))}},15000);
        });
      }
      function valueAtPath(value,path){
        if(!path)return value;
        return path.split('.').filter(Boolean).reduce(function(current,key){return current==null?undefined:current[key]},value);
      }
      function displayValue(value){
        if(value==null)return '';
        return typeof value==='object'?JSON.stringify(value,null,2):String(value);
      }
      function clear(){while(content.firstChild)content.removeChild(content.firstChild)}
      function addField(parent,key,value){
        var row=document.createElement('div');row.className='field';
        var label=document.createElement('strong');label.textContent=key;
        var text=document.createElement('span');text.textContent=displayValue(value);
        row.appendChild(label);row.appendChild(text);parent.appendChild(row);
      }
      function rowsFrom(value){return Array.isArray(value)?value:(value&&typeof value==='object'?[value]:[])}
      function renderTable(value){
        var rows=rowsFrom(value);if(!rows.length)return renderEmpty();
        var columns=(config.columns||[]).filter(Boolean);
        if(!columns.length)columns=Object.keys(rows[0]||{}).slice(0,12);
        var wrap=document.createElement('div');wrap.className='table-wrap';
        var table=document.createElement('table');var head=document.createElement('thead');var headRow=document.createElement('tr');
        columns.forEach(function(column){var th=document.createElement('th');th.textContent=column;headRow.appendChild(th)});head.appendChild(headRow);table.appendChild(head);
        var body=document.createElement('tbody');rows.forEach(function(row){var tr=document.createElement('tr');columns.forEach(function(column){var td=document.createElement('td');td.textContent=displayValue(valueAtPath(row,column));tr.appendChild(td)});body.appendChild(tr)});table.appendChild(body);wrap.appendChild(table);content.appendChild(wrap);
      }
      function renderCards(value){
        var rows=rowsFrom(value);if(!rows.length)return renderEmpty();
        var grid=document.createElement('div');grid.className='cards';
        rows.forEach(function(row,index){
          var card=document.createElement('article');card.className='card';
          var heading=document.createElement('h2');heading.textContent=displayValue(valueAtPath(row,config.titleField||''))||('Item '+(index+1));card.appendChild(heading);
          if(config.subtitleField){var subtitle=document.createElement('p');subtitle.textContent=displayValue(valueAtPath(row,config.subtitleField));card.appendChild(subtitle)}
          Object.keys(row||{}).slice(0,8).forEach(function(key){if(key!==config.titleField&&key!==config.subtitleField)addField(card,key,row[key])});grid.appendChild(card);
        });content.appendChild(grid);
      }
      function renderDetails(value){
        var rows=rowsFrom(value);if(!rows.length)return renderEmpty();
        var grid=document.createElement('div');grid.className='cards';rows.forEach(function(row){var panel=document.createElement('section');panel.className='details';Object.keys(row||{}).forEach(function(key){addField(panel,key,row[key])});grid.appendChild(panel)});content.appendChild(grid);
      }
      function renderJson(value){var pre=document.createElement('pre');pre.textContent=JSON.stringify(value,null,2);content.appendChild(pre)}
      function renderEmpty(){var empty=document.createElement('div');empty.className='empty';empty.textContent=config.emptyMessage||'No data returned.';content.appendChild(empty)}
      function renderError(message){clear();var box=document.createElement('div');box.className='error';box.textContent=message;content.appendChild(box);status.textContent='Error'}
      function extractResult(result){
        if(result&&result.structuredContent!==undefined)return result.structuredContent;
        var block=result&&result.content&&result.content.find(function(entry){return entry.type==='text'});
        if(!block)return {};
        try{return JSON.parse(block.text)}catch(_error){return {value:block.text}}
      }
      function renderResult(result){
        if(result&&result.isError)return renderError(displayValue(extractResult(result))||'Tool execution failed.');
        clear();var value=valueAtPath(extractResult(result),config.dataPath||'');
        if(config.viewType==='table')renderTable(value);else if(config.viewType==='cards')renderCards(value);else if(config.viewType==='details')renderDetails(value);else renderJson(value);
        status.textContent='Updated';refresh.disabled=false;notify('ui/notifications/size-changed',{width:Math.ceil(window.innerWidth),height:Math.ceil(document.documentElement.getBoundingClientRect().height)});
      }
      function applyHostContext(context){if(context&&context.theme)document.documentElement.style.colorScheme=context.theme}
      window.addEventListener('message',function(event){
        if(event.source!==window.parent)return;var message=event.data;if(!message||message.jsonrpc!=='2.0')return;
        if(message.id!==undefined&&!message.method){var callback=pending.get(message.id);if(callback){pending.delete(message.id);message.error?callback.reject(new Error(message.error.message||'Host error')):callback.resolve(message.result)}return}
        if(message.method==='ui/notifications/tool-input'){lastArguments=(message.params&&message.params.arguments)||{};return}
        if(message.method==='ui/notifications/tool-result'){renderResult(message.params||{});return}
        if(message.method==='ui/notifications/host-context-changed'){applyHostContext(message.params||{})}
      });
      refresh.addEventListener('click',function(){refresh.disabled=true;status.textContent='Refreshing…';request('tools/call',{name:config.toolName,arguments:lastArguments}).then(renderResult).catch(function(error){renderError(error.message)}).finally(function(){refresh.disabled=false})});
      request('ui/initialize',{appInfo:{name:config.name,version:'1.0.0'},appCapabilities:{},protocolVersion:protocolVersion}).then(function(result){applyHostContext(result&&result.hostContext);notify('ui/notifications/initialized');status.textContent='Ready'}).catch(function(error){renderError(error.message)});
      if(typeof ResizeObserver!=='undefined'){new ResizeObserver(function(){notify('ui/notifications/size-changed',{width:Math.ceil(window.innerWidth),height:Math.ceil(document.documentElement.getBoundingClientRect().height)})}).observe(document.body)}
    })();
  </script>
</body>
</html>`;
}
