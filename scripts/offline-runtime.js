/* Browser-local prototype bridge. No accounts, servers, analytics or external assets. */
(()=>{
 const key='martijns-knalfeest-prototype-v3';
 let stored=null;
 try{stored=JSON.parse(localStorage.getItem(key)||'null');}catch{}
 window.openai={
  widgetState:stored,
  setWidgetState(value){this.widgetState=value;try{localStorage.setItem(key,JSON.stringify(value));}catch{}return Promise.resolve();}
 };
 const symbols={info:'ⓘ','user-round-pen':'✎',store:'🏪',flag:'⚑',footprints:'👣',bike:'🚲',coins:'🪙',users:'👥','book-open':'📖',wrench:'🔧',hammer:'🔨',smartphone:'📱',music:'♫','repeat-2':'⇄',shirt:'👕'};
 globalThis.lucide={createIcons(){document.querySelectorAll('i[data-lucide]').forEach(node=>{node.textContent=symbols[node.dataset.lucide]||'◆';});}};
})();
