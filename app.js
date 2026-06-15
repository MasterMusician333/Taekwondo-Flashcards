
const ranks = [
  { name:"White", beltColor:"white", stripeColor:"", tips:"" },
  { name:"White / Yellow Stripe", beltColor:"white", stripeColor:"yellow", tips:"" },
  { name:"White / Yellow Stripe / Yellow Tip", beltColor:"white", stripeColor:"yellow", tips:"yellow" },
  { name:"Yellow", beltColor:"yellow", stripeColor:"", tips:"" },
  { name:"Yellow / Green Tip", beltColor:"yellow", stripeColor:"", tips:"green" },
  { name:"Green", beltColor:"green", stripeColor:"", tips:"" },
  { name:"Green / Blue Tip", beltColor:"green", stripeColor:"", tips:"blue" },
  { name:"Blue", beltColor:"blue", stripeColor:"", tips:"" },
  { name:"Blue / Brown Tip", beltColor:"blue", stripeColor:"", tips:"brown" },
  { name:"Brown", beltColor:"brown", stripeColor:"", tips:"" },
  { name:"Brown / Red Tip", beltColor:"brown", stripeColor:"", tips:"red" },
  { name:"Red", beltColor:"red", stripeColor:"", tips:"" },
  { name:"Red / Black Tip", beltColor:"red", stripeColor:"", tips:"black" },
  { name:"Red / Black Stripe", beltColor:"red", stripeColor:"black", tips:"" },
  { name:"Red / Black Stripe / Black Tip", beltColor:"red", stripeColor:"black", tips:"black" },
  { name:"1st Dan", beltColor:"black", stripeColor:"", tips:"yellow" },
  { name:"2nd Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow" },
  { name:"3rd Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow" },
  { name:"4th Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow,yellow" },
  { name:"5th Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow,yellow,yellow" },
  { name:"6th Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow,yellow,yellow,yellow" },
  { name:"7th Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow,yellow,yellow,yellow,yellow" },
  { name:"8th Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow,yellow,yellow,yellow,yellow,yellow" },
  { name:"9th Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow,yellow,yellow,yellow,yellow,yellow,yellow" },
  { name:"10th Dan", beltColor:"black", stripeColor:"", tips:"yellow,yellow,yellow,yellow,yellow,yellow,yellow,yellow,yellow,yellow" }
];

let currentSet = [];
let currentIndex = 0;
let currentFront = "korean";
const $ = id => document.getElementById(id);

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function getCards(){return JSON.parse(localStorage.getItem("tkdCardsV2")||"[]")}
function setCards(cards){localStorage.setItem("tkdCardsV2",JSON.stringify(cards))}
function escapeHtml(v){return String(v||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]))}

function migrateOldCards(){
  const old = JSON.parse(localStorage.getItem("cards")||"[]");
  if(old.length && !getCards().length){
    setCards(old.map(c=>({
      id:uid(), korean:c.korean||"", english:c.english||"", pronunciation:c.pronunciation||"",
      notes:c.notes||"", category:c.category||"", rank:c.rank||c.dan||"White",
      beltColor:c.beltColor||"white", stripeColor:c.stripeColor||"", tips:c.tips||"", status:"new"
    })));
  }
}

function populateRanks(){
  $("rank").innerHTML = ranks.map(r=>`<option value="${r.name}">${r.name}</option>`).join("") + `<option value="Custom / Other">Custom / Other</option>`;
  $("studyFilter").innerHTML =
    `<option value="__all">All Cards</option>` +
    ranks.map(r=>`<option value="${r.name}">${r.name}</option>`).join("") +
    `<option value="__dan">All Dan Cards</option><option value="__practice">Need Practice</option><option value="__mastered">Mastered</option>`;
}

function applyRankDefaults(){
  const selected = ranks.find(r=>r.name===$("rank").value);
  if(!selected) return;
  $("beltColor").value = selected.beltColor;
  $("stripeColor").value = selected.stripeColor;
  $("tips").value = selected.tips;
  renderPreview();
}

function beltHtml(card){
  let html = `<div class="belt" style="background:${escapeHtml(card.beltColor||"white")}">`;
  if(card.stripeColor) html += `<div class="stripe" style="background:${escapeHtml(card.stripeColor)}"></div>`;
  (card.tips||"").split(",").map(x=>x.trim()).filter(Boolean).forEach((tip,i)=>{
    html += `<div class="tip" style="background:${escapeHtml(tip)};right:${i*14}px"></div>`;
  });
  return html + `</div>`;
}

function renderPreview(){
  $("beltPreview").innerHTML = beltHtml({beltColor:$("beltColor").value,stripeColor:$("stripeColor").value,tips:$("tips").value});
}

function saveCard(){
  const cards = getCards();
  const id = $("editId").value || uid();
  const existingIndex = cards.findIndex(c=>c.id===id);
  const card = {
    id, korean:$("korean").value.trim(), english:$("english").value.trim(),
    pronunciation:$("pronunciation").value.trim(), notes:$("notes").value.trim(),
    category:$("category").value.trim(), rank:$("rank").value,
    beltColor:$("beltColor").value, stripeColor:$("stripeColor").value, tips:$("tips").value.trim(),
    status: existingIndex>=0 ? cards[existingIndex].status : "new"
  };
  if(!card.korean || !card.english){alert("Please enter both Korean and English.");return}
  if(existingIndex>=0) cards[existingIndex]=card; else cards.push(card);
  setCards(cards);
  $("saveMessage").textContent = `Saved: ${card.korean} — ${card.english}`;
  clearForm(false);
  refreshAll(id);
  document.querySelector(".saved-panel").scrollIntoView({behavior:"smooth",block:"start"});
}

function clearForm(clearMessage=true){
  ["editId","korean","english","pronunciation","notes","category","tips"].forEach(id=>$(id).value="");
  $("rank").selectedIndex=0;
  applyRankDefaults();
  if(clearMessage) $("saveMessage").textContent="";
}

function editCard(id){
  const c=getCards().find(x=>x.id===id); if(!c) return;
  $("editId").value=c.id; $("korean").value=c.korean; $("english").value=c.english;
  $("pronunciation").value=c.pronunciation||""; $("notes").value=c.notes||""; $("category").value=c.category||"";
  $("rank").value=c.rank||"Custom / Other"; $("beltColor").value=c.beltColor||"white"; $("stripeColor").value=c.stripeColor||""; $("tips").value=c.tips||"";
  renderPreview(); window.scrollTo({top:0,behavior:"smooth"});
}

function deleteCard(id){
  if(!confirm("Delete this card?")) return;
  setCards(getCards().filter(c=>c.id!==id)); refreshAll();
}

function filteredCards(){
  const f=$("studyFilter").value; const cards=getCards();
  if(f==="__all") return cards;
  if(f==="__dan") return cards.filter(c=>/dan/i.test(c.rank||""));
  if(f==="__practice") return cards.filter(c=>c.status==="practice");
  if(f==="__mastered") return cards.filter(c=>c.status==="mastered");
  return cards.filter(c=>c.rank===f);
}

function rebuildStudySet(keepId=null){
  currentSet = filteredCards();
  if($("studyOrder").value==="random") currentSet = currentSet.slice().sort(()=>Math.random()-.5);
  if(!currentSet.length){
    $("cardPicker").innerHTML=`<option>No cards in this section</option>`;
    currentIndex=0; renderStudyCard(); return;
  }
  if(keepId){ const found=currentSet.findIndex(c=>c.id===keepId); currentIndex=found>=0?found:0; }
  else currentIndex=Math.min(currentIndex,currentSet.length-1);
  $("cardPicker").innerHTML=currentSet.map((c,i)=>`<option value="${i}">${escapeHtml(c.korean)} — ${escapeHtml(c.english)}</option>`).join("");
  $("cardPicker").value=String(currentIndex); setFrontSide(); renderStudyCard();
}

function setFrontSide(){ const m=$("startSide").value; currentFront=m==="random"?(Math.random()>.5?"korean":"english"):m; }

function renderStudyCard(){
  $("flashcard").classList.remove("flipped");
  if(!currentSet.length){
    $("frontBelt").innerHTML=""; $("backBelt").innerHTML="";
    $("frontText").textContent="No cards"; $("backText").textContent="Add cards or choose another section";
    $("backExtra").textContent=""; $("counter").textContent="No cards in this section"; return;
  }
  const c=currentSet[currentIndex];
  $("frontBelt").innerHTML=beltHtml(c); $("backBelt").innerHTML=beltHtml(c);
  $("frontText").textContent=currentFront==="korean"?c.korean:c.english;
  $("backText").textContent=currentFront==="korean"?c.english:c.korean;
  const extras=[]; if(c.pronunciation) extras.push(`Pronunciation: ${c.pronunciation}`); if(c.notes) extras.push(c.notes);
  $("backExtra").textContent=extras.join(" • ");
  $("counter").textContent=`Card ${currentIndex+1} of ${currentSet.length} — ${c.rank||"Unranked"}`;
  $("cardPicker").value=String(currentIndex);
}

function nextCard(){ if(!currentSet.length)return; currentIndex=(currentIndex+1)%currentSet.length; setFrontSide(); renderStudyCard(); }
function prevCard(){ if(!currentSet.length)return; currentIndex=(currentIndex-1+currentSet.length)%currentSet.length; setFrontSide(); renderStudyCard(); }
function flipCard(){ $("flashcard").classList.toggle("flipped"); }

function markStatus(status){
  if(!currentSet.length)return; const id=currentSet[currentIndex].id; const cards=getCards(); const idx=cards.findIndex(c=>c.id===id);
  if(idx>=0){cards[idx].status=status; setCards(cards); refreshAll(id);}
}

function renderCardList(){
  const cards=getCards(); $("cardCountBadge").textContent=cards.length;
  if(!cards.length){$("cardList").innerHTML=`<div class="empty-list">No saved cards yet. After you tap Save Card, they will appear here.</div>`; return;}
  $("cardList").innerHTML=cards.map(c=>`
    <div class="card-item">
      <strong>${escapeHtml(c.korean)} — ${escapeHtml(c.english)}</strong>
      <small>${escapeHtml(c.rank||"Unranked")} • ${escapeHtml(c.category||"No category")} • ${escapeHtml(c.status||"new")}</small>
      <div class="card-actions">
        <button class="secondary" onclick="editCard('${c.id}')">Edit</button>
        <button class="warning" onclick="deleteCard('${c.id}')">Delete</button>
      </div>
    </div>`).join("");
}

function exportCards(){
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),cards:getCards()},null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="taekwondo-flashcards-backup.json"; a.click();
}

function importCards(file){
  const r=new FileReader();
  r.onload=()=>{try{const p=JSON.parse(r.result); const imported=Array.isArray(p)?p:p.cards; if(!Array.isArray(imported)) throw new Error();
    setCards(imported.map(c=>({id:c.id||uid(),status:c.status||"new",...c}))); refreshAll(); alert("Backup imported.");
  }catch(e){alert("Could not import that backup file.");}};
  r.readAsText(file);
}

function refreshAll(keepId=null){ renderCardList(); rebuildStudySet(keepId); }

function setupSwipe(){
  let startX=0;
  $("flashcard").addEventListener("touchstart",e=>{startX=e.changedTouches[0].screenX},{passive:true});
  $("flashcard").addEventListener("touchend",e=>{const dx=e.changedTouches[0].screenX-startX;if(Math.abs(dx)<55)return;dx<0?nextCard():prevCard();},{passive:true});
}

function init(){
  migrateOldCards(); populateRanks(); applyRankDefaults();
  $("rank").addEventListener("change",applyRankDefaults);
  ["beltColor","stripeColor","tips"].forEach(id=>$(id).addEventListener("input",renderPreview));
  $("saveBtn").addEventListener("click",saveCard); $("clearBtn").addEventListener("click",()=>clearForm(true));
  $("studyFilter").addEventListener("change",()=>rebuildStudySet());
  $("startSide").addEventListener("change",()=>{setFrontSide();renderStudyCard()});
  $("studyOrder").addEventListener("change",()=>rebuildStudySet());
  $("cardPicker").addEventListener("change",()=>{currentIndex=Number($("cardPicker").value)||0;setFrontSide();renderStudyCard()});
  $("nextBtn").addEventListener("click",nextCard); $("prevBtn").addEventListener("click",prevCard); $("flipBtn").addEventListener("click",flipCard);
  $("flashcard").addEventListener("click",flipCard);
  $("knowBtn").addEventListener("click",()=>markStatus("mastered")); $("practiceBtn").addEventListener("click",()=>markStatus("practice"));
  $("exportBtn").addEventListener("click",exportCards); $("importBtn").addEventListener("click",()=>$("importFile").click());
  $("importFile").addEventListener("change",e=>{if(e.target.files[0])importCards(e.target.files[0])});
  setupSwipe(); refreshAll();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
}
init();
