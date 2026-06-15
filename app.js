
function saveCard(){
const cards=JSON.parse(localStorage.cards||'[]');
cards.push({
korean:korean.value,english:english.value,
pronunciation:pronunciation.value,
category:category.value,dan:dan.value,
beltColor:beltColor.value,stripeColor:stripeColor.value,tips:tips.value
});
localStorage.cards=JSON.stringify(cards);
alert('Saved');
}
function beltHtml(c){
let h=`<div class="belt" style="background:${c.beltColor}">`;
if(c.stripeColor)h+=`<div class="stripe" style="background:${c.stripeColor}"></div>`;
(c.tips||'').split(',').map(x=>x.trim()).filter(Boolean).forEach((t,i)=>{
h+=`<div class="tip" style="background:${t};right:${i*12}px"></div>`;
});
return h+'</div>';
}
function randomCard(){
const cards=JSON.parse(localStorage.cards||'[]');
if(!cards.length){card.innerHTML='No cards';return;}
const c=cards[Math.floor(Math.random()*cards.length)];
card.innerHTML=beltHtml(c)+
`<h2>${c.korean}</h2>
<button onclick="document.getElementById('answer').style.display='block'">Show Answer</button>
<div id="answer" style="display:none">
<p><b>Meaning:</b> ${c.english}</p>
<p><b>Pronunciation:</b> ${c.pronunciation}</p>
<p><b>Category:</b> ${c.category}</p>
<p><b>Rank:</b> ${c.dan}</p>
</div>`;
}
if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js');}
