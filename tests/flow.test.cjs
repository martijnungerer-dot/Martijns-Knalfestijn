const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../src/prototype.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Small event/clock harness: this checks game flows, not browser layout or networking.
function harness(){
 let now=100000,interval,sequence=0;
 const timeouts=new Map(),elements=new Map();
 class Element{
  constructor(dataset={}){this.dataset=dataset;this.attrs={};this.handlers={};this.style={};this.hidden=false;this.disabled=false;this.isConnected=true;this.textContent='';this.innerHTML='';this.value='Nina';this.children=new Map();this.classList={toggle(){}};}
  setAttribute(k,v){this.attrs[k]=v;}
  removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,fn){this.handlers[k]=fn;}
  focus(){}
  scrollIntoView(){}
  appendChild(node){this.children.set('small',node);}
  querySelector(s){if(s==='small')return this.children.get(s)||null;if(!this.children.has(s))this.children.set(s,new Element());return this.children.get(s);}
  click(){if(!this.disabled)this.handlers.click?.();}
 }
 const lists={
  '[data-number]':[4,8,6,9].map(n=>new Element({number:String(n)})),
  '[data-choose]':['A','B'].map(x=>new Element({choose:x})),
  '[data-screen]':['puzzle','choice','training','avatar','shop','info','preview','quest'].map(x=>new Element({screen:x})),
  '[data-color]':['red','blue','purple','green'].map(x=>new Element({color:x})),
  '[data-accessory]':['book-open','wrench','hammer','smartphone'].map(x=>new Element({accessory:x})),
  '[data-product]':[['dj',10],['swap',15],['outfit',5]].map(([x,n])=>new Element({product:x,price:String(n)})),
  '[data-screen] h2':Array.from({length:8},()=>new Element()),
  '[data-close]':Array.from({length:3},()=>new Element()),
  '[data-final]':['A','B','A','B'].map(x=>new Element({final:x})),
  '[data-preview]':['A','B','C','D'].map(x=>new Element({preview:x})),
  '[data-quest]':['martijn','colleague','company','new'].map(x=>new Element({quest:x})),
  '[data-quest-answer]':['martijn','other'].map(x=>new Element({questAnswer:x}))
 };
 const get=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s);};
 const root={querySelector:get,querySelectorAll:s=>lists[s]||[],isConnected:true};
 vm.runInNewContext(script,{
  document:{getElementById:()=>root,createElement:()=>new Element(),activeElement:null},
  window:{addEventListener(){}},Date:{now:()=>now},
  setInterval:fn=>{interval=fn;return 1;},clearInterval(){},
  setTimeout:(fn,ms)=>{const id=++sequence;timeouts.set(id,{fn,at:now+ms});return id;},
  clearTimeout:id=>timeouts.delete(id)
 });
 function advance(ms){now+=ms;for(const [id,t] of [...timeouts])if(t.at<=now){timeouts.delete(id);t.fn();}interval();}
 function answerCorrect(){get('[data-main]').click();lists['[data-number]'][0].click();lists['[data-number]'][2].click();get('[data-submit]').click();}
 return {get,lists,advance,answerCorrect};
}

test('correct answer chooses visible target, earns points, and workout closes automatically',()=>{
 const h=harness();h.answerCorrect();
 assert.equal(h.get('[data-choice-title]').textContent,'Nina kiest');
 assert.match(h.get('[data-ranking]').innerHTML,/Nina, 4 punten/);
 h.lists['[data-choose]'][1].click();
 assert.match(h.get('[data-goal-path]').attrs.d,/75/);
 h.advance(1000);h.advance(10000);
 assert.match(h.get('[data-training-title]').innerHTML,/Row/);
 h.advance(9000);
 assert.equal(h.get('[data-overlay]').hidden,true);
 assert.equal(h.get('[data-main]').disabled,false);
 assert.equal(h.get('[data-world]').textContent,'METCON');
});

test('no answer and no choice both advance without a human host',()=>{
 const h=harness();h.get('[data-main]').click();h.advance(11000);h.advance(1000);
 assert.equal(h.get('[data-main]').disabled,true);
 h.advance(9000);assert.equal(h.get('[data-overlay]').hidden,true);
 const j=harness();j.answerCorrect();j.advance(6000);j.advance(5000);j.advance(9000);
 assert.equal(j.get('[data-overlay]').hidden,true);
});

test('future shop is only a preview; reached shop spends coins without spending points',()=>{
 const h=harness();h.get('[data-shop-button]').click();
 assert.equal(h.get('[data-preview-title]').textContent,'De Knalwinkel');
 h.lists['[data-close]'][0].click();
 h.answerCorrect();h.lists['[data-choose]'][0].click();h.advance(11000);h.advance(9000);
 h.get('[data-shop-button]').click();h.lists['[data-product]'][0].click();
 assert.equal(h.get('[data-shop-wallet]').textContent,'● 25');
 assert.match(h.get('[data-ranking]').innerHTML,/Nina, 4 punten/);
 h.lists['[data-product]'][0].click();
 assert.equal(h.get('[data-shop-wallet]').textContent,'● 25');
});

test('sidequest points cannot be claimed twice in one round and unknown facts give no points',()=>{
 const h=harness();h.lists['[data-quest]'][0].click();h.lists['[data-quest-answer]'][0].click();
 assert.match(h.get('[data-ranking]').innerHTML,/Nina, 4 punten/);
 h.lists['[data-close]'][2].click();h.lists['[data-quest]'][0].click();h.lists['[data-quest-answer]'][0].click();
 assert.match(h.get('[data-ranking]').innerHTML,/Nina, 4 punten/);
 h.lists['[data-quest]'][2].click();assert.equal(h.get('.kr-quest-answers').hidden,true);
});

test('avatar and name change together; name is escaped in scoreboard',()=>{
 const h=harness();h.get('[data-edit]').click();h.lists['[data-accessory]'][2].click();
 h.get('[data-name]').value='<img src=x>';h.get('[data-done]').click();
 assert.match(h.get('[data-avatar-preview]').innerHTML,/hammer/);
 assert.match(h.get('[data-ranking]').innerHTML,/&lt;img src=x&gt;/);
 assert.doesNotMatch(h.get('[data-ranking]').innerHTML,/<img src=x>/);
});

test('finales can be inspected without silently choosing a different route',()=>{
 const h=harness();const before=h.get('[data-goal-path]').attrs.d;
 h.lists['[data-final]'][1].click();
 assert.equal(h.get('[data-preview-title]').textContent,'De Motor');
 assert.match(h.get('[data-preview-detail]').textContent,/6 minuten/);
 assert.equal(h.get('[data-goal-path]').attrs.d,before);
});

test('exported document includes the exact source, valid scripts, and no required external scripts',()=>{
 const output=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.ok(output.startsWith('<!doctype html>'));
 assert.ok(output.includes(html));
 assert.doesNotMatch(output,/<script[^>]+src=/);
 for(const match of output.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});
