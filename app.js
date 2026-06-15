
const presetRanks = [
  {name:"White", beltColor:"white", stripeColor:"", tips:""},
  {name:"White / Yellow Stripe", beltColor:"white", stripeColor:"yellow", tips:""},
  {name:"White / Yellow Stripe / Yellow Tip", beltColor:"white", stripeColor:"yellow", tips:"yellow"},
  {name:"Yellow", beltColor:"yellow", stripeColor:"", tips:""},
  {name:"Yellow / Green Tip", beltColor:"yellow", stripeColor:"", tips:"green"},
  {name:"Green", beltColor:"green", stripeColor:"", tips:""},
  {name:"Green / Blue Tip", beltColor:"green", stripeColor:"", tips:"blue"},
  {name:"Blue", beltColor:"blue", stripeColor:"", tips:""},
  {name:"Blue / Brown Tip", beltColor:"blue", stripeColor:"", tips:"brown"},
  {name:"Brown", beltColor:"brown", stripeColor:"", tips:""},
  {name:"Brown / Red Tip", beltColor:"brown", stripeColor:"", tips:"red"},
  {name:"Red", beltColor:"red", stripeColor:"", tips:""},
  {name:"Red / Black Tip", beltColor:"red", stripeColor:"", tips:"black"},
  {name:"Red / Black Stripe", beltColor:"red", stripeColor:"black", tips:""},
  {name:"Red / Black Stripe / Black Tip", beltColor:"red", stripeColor:"black", tips:"black"},
  ...Array.from({length:10},(_,i)=>({name:`${i+1}${suffix(i+1)} Dan`, beltColor:"black", stripeColor:"", tips:Array(i+1).fill("yellow").join(",")}))
];

let currentSet=[], currentIndex=0, currentFront="korean";
const $=id=>document.getElementById(id);

function suffix(n){return n===1?"st":n===2?"nd":n===3?"rd":"th"}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function getCards(){return JSON.parse(localStorage.getItem("tkdCardsV22")||localStorage.getItem("tkdCardsV2")||localStorage.getItem("cards")||"[]").map(normalizeCard)}
function setCards(cards){localStorage.setItem("tkdCardsV22",JSON.stringify(cards));}
function esc(v){return String(v||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}

function normalizeCard(c){
  return {
    id:c.id||uid(),
    korean:c.korean||"",
    english:c.english||"",
    pronunciation:c.pronunciation||"",
    notes:c.notes||"",
    category:c.category||"",
    rank:c.rank||c.danDesignation||c.dan||"Unranked",
    danDesignation:c.danDesignation||(/dan/i.test(c.rank||c.dan||"")?(c.rank||c.dan):""),
    beltColor:c.beltColor||"white",
    stripeColor:c.stripeColor||"",
    tips:c.tips||"",
    status:c.status||"new"
  };
}

function initOptions(){
  $("rankOptions").innerHTML=presetRanks.map(r=>`<option value="${r.name}"></option>`).join("");
  rebuildFilters();
}

function rebuildFilters(){
  const cards=getCards();
  const savedRanks=[...new Set(cards.map(c=>c.rank).filter(Boolean))];
  const allRanks=[...new Set([...presetRanks.map(r=>r.name),...savedRanks])];
  $("studyFilter").innerHTML=`<option value="__all">All Cards</option>`+
    allRanks.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join("")+
    `<option value="__dan">All Dan Cards</option><option value="__practice">Need Practice</option><option value="__mastered">Mastered</option>`;
}

function setScreen(name){
  $("studyScreen").classList.toggle("active",name==="study");
  $("editScreen").classList.toggle("active",name==="edit");
  closeDrawer();
}

function openDrawer(){$("drawer").classList.add("open");$("drawerShade").classList.add("open");}
function closeDrawer(){$("drawer").classList.remove("open");$("drawerShade").classList.remove("open");}

function applyDan(){
  const dan=$("danDesignation").value;
  if(!dan) return;
  const n=parseInt(dan,10);
  $("rankText").value=dan;
  $("beltColor").value="black";
  $("stripeColor").value="";
  $("tips").value=Array(n).fill("yellow").join(",");
  renderPreview();
}

function maybeApplyRankTextPreset(){
  const preset=presetRanks.find(r=>r.name.toLowerCase()===$("rankText").value.trim().toLowerCase());
  if(!preset) return;
  $("beltColor").value=preset.beltColor;
  $("stripeColor").value=preset.stripeColor;
  $("tips").value=preset.tips;
  if(/dan/i.test(preset.name)) $("danDesignation").value=preset.name;
  renderPreview();
}

function beltHtml(c){
  let html=`<div class="belt" style="background:${esc(c.beltColor||"white")}">`;
  if(c.stripeColor) html+=`<div class="stripe" style="background:${esc(c.stripeColor)}"></div>`;
  (c.tips||"").split(",").map(x=>x.trim()).filter(Boolean).forEach((tip,i)=>{
    html+=`<div class="tip" style="background:${esc(tip)};right:${i*14}px"></div>`;
  });
  return html+"</div>";
}

function renderPreview(){
  $("beltPreview").innerHTML=beltHtml({beltColor:$("beltColor").value,stripeColor:$("stripeColor").value,tips:$("tips").value});
}

function saveCard(){
  const cards=getCards();
  const id=$("editId").value||uid();
  const idx=cards.findIndex(c=>c.id===id);
  const rankText=$("rankText").value.trim() || $("danDesignation").value || "Unranked";
  const card={
    id,
    korean:$("korean").value.trim(),
    english:$("english").value.trim(),
    pronunciation:$("pronunciation").value.trim(),
    notes:$("notes").value.trim(),
    category:$("category").value.trim(),
    rank:rankText,
    danDesignation:$("danDesignation").value,
    beltColor:$("beltColor").value,
    stripeColor:$("stripeColor").value,
    tips:$("tips").value.trim(),
    status:idx>=0?cards[idx].status:"new"
  };
  if(!card.korean||!card.english){alert("Please enter both the Korean term and English meaning.");return;}
  if(idx>=0) cards[idx]=card; else cards.push(card);
  setCards(cards);
  $("saveMessage").textContent=`Saved: ${card.korean} — ${card.english}`;
  clearForm(false);
  refreshAll(id);
  renderCardList();
}

function clearForm(clearMessage=true){
  ["editId","korean","english","pronunciation","notes","category","rankText","tips"].forEach(id=>$(id).value="");
  $("danDesignation").value="";
  $("beltColor").value="white";$("stripeColor").value="";
  renderPreview();
  if(clearMessage)$("saveMessage").textContent="";
}

function editCard(id){
  const c=getCards().find(x=>x.id===id); if(!c)return;
  $("editId").value=c.id; $("korean").value=c.korean; $("english").value=c.english;
  $("pronunciation").value=c.pronunciation; $("notes").value=c.notes; $("category").value=c.category;
  $("rankText").value=c.rank; $("danDesignation").value=c.danDesignation||"";
  $("beltColor").value=c.beltColor; $("stripeColor").value=c.stripeColor; $("tips").value=c.tips;
  renderPreview(); setScreen("edit"); window.scrollTo({top:0,behavior:"smooth"});
}

function deleteCard(id){
  if(!confirm("Delete this card?"))return;
  setCards(getCards().filter(c=>c.id!==id)); refreshAll();
}

function filteredCards(){
  const f=$("studyFilter").value, cards=getCards();
  if(f==="__all")return cards;
  if(f==="__dan")return cards.filter(c=>/dan/i.test((c.rank||"")+" "+(c.danDesignation||"")));
  if(f==="__practice")return cards.filter(c=>c.status==="practice");
  if(f==="__mastered")return cards.filter(c=>c.status==="mastered");
  return cards.filter(c=>c.rank===f);
}

function rebuildStudySet(keepId=null){
  currentSet=filteredCards();
  if($("studyOrder").value==="random") currentSet=currentSet.slice().sort(()=>Math.random()-.5);
  if(!currentSet.length){
    $("cardPicker").innerHTML="<option>No cards in this section</option>";
    currentIndex=0; renderStudyCard(); return;
  }
  if(keepId){const found=currentSet.findIndex(c=>c.id===keepId);currentIndex=found>=0?found:0;}
  else currentIndex=Math.min(currentIndex,currentSet.length-1);
  $("cardPicker").innerHTML=currentSet.map((c,i)=>`<option value="${i}">${esc(c.korean)} — ${esc(c.english)}</option>`).join("");
  $("cardPicker").value=String(currentIndex);
  setFrontSide(); renderStudyCard();
}

function setFrontSide(){
  const m=$("startSide").value;
  currentFront=m==="random"?(Math.random()>.5?"korean":"english"):m;
}

function renderStudyCard(){
  $("flashcard").classList.remove("flipped");
  const count=getCards().length;
  $("statusLine").textContent=count?`${count} saved card${count===1?"":"s"}`:"No cards saved yet";
  if(!currentSet.length){
    $("frontBelt").innerHTML="";$("backBelt").innerHTML="";
    $("frontText").textContent="No cards";
    $("backText").textContent="Add cards or choose another section";
    $("backExtra").textContent="";
    $("counter").textContent="No cards in this section";
    return;
  }
  const c=currentSet[currentIndex];
  $("frontBelt").innerHTML=beltHtml(c);$("backBelt").innerHTML=beltHtml(c);
  $("frontText").textContent=currentFront==="korean"?c.korean:c.english;
  $("backText").textContent=currentFront==="korean"?c.english:c.korean;
  const extras=[];
  if(c.pronunciation)extras.push(`Pronunciation: ${c.pronunciation}`);
  if(c.notes)extras.push(c.notes);
  $("backExtra").textContent=extras.join(" • ");
  $("counter").textContent=`Card ${currentIndex+1} of ${currentSet.length} — ${c.rank||"Unranked"}`;
  $("cardPicker").value=String(currentIndex);
}

function nextCard(){if(!currentSet.length)return;currentIndex=(currentIndex+1)%currentSet.length;setFrontSide();renderStudyCard();}
function prevCard(){if(!currentSet.length)return;currentIndex=(currentIndex-1+currentSet.length)%currentSet.length;setFrontSide();renderStudyCard();}
function flipCard(){$("flashcard").classList.toggle("flipped");}

function markStatus(status){
  if(!currentSet.length)return;
  const id=currentSet[currentIndex].id, cards=getCards(), idx=cards.findIndex(c=>c.id===id);
  if(idx>=0){cards[idx].status=status;setCards(cards);refreshAll(id);}
}

function renderCardList(){
  const cards=getCards(); $("cardCountBadge").textContent=cards.length;
  if(!cards.length){$("cardList").innerHTML='<div class="empty-list">No saved cards yet. Save one above and it will appear here.</div>';return;}
  $("cardList").innerHTML=cards.map(c=>`
    <div class="card-item">
      <strong>${esc(c.korean)} — ${esc(c.english)}</strong>
      <small>${esc(c.rank||"Unranked")} • ${esc(c.category||"No category")} • ${esc(c.status||"new")}</small>
      <div class="card-actions">
        <button class="secondary" onclick="editCard('${c.id}')">Edit</button>
        <button class="warning" onclick="deleteCard('${c.id}')">Delete</button>
      </div>
    </div>`).join("");
}

function exportCards(){
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),cards:getCards()},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="taekwondo-flashcards-backup.json";a.click();
}

function importCards(file){
  const r=new FileReader();
  r.onload=()=>{try{
    const p=JSON.parse(r.result), imported=Array.isArray(p)?p:p.cards;
    if(!Array.isArray(imported))throw new Error();
    setCards(imported.map(normalizeCard)); refreshAll(); alert("Backup imported.");
  }catch(e){alert("Could not import that backup file.");}};
  r.readAsText(file);
}

function refreshAll(keepId=null){
  rebuildFilters();
  renderCardList();
  rebuildStudySet(keepId);
}

function setupSwipe(){
  let startX=0;
  $("flashcard").addEventListener("touchstart",e=>{startX=e.changedTouches[0].screenX},{passive:true});
  $("flashcard").addEventListener("touchend",e=>{const dx=e.changedTouches[0].screenX-startX;if(Math.abs(dx)<55)return;dx<0?nextCard():prevCard();},{passive:true});
}

function init(){
  initOptions(); renderPreview(); refreshAll();
  $("menuBtn").addEventListener("click",openDrawer);
  $("drawerShade").addEventListener("click",closeDrawer);
  $("addScreenBtn").addEventListener("click",()=>setScreen("edit"));
  $("studyScreenBtn").addEventListener("click",()=>setScreen("study"));
  $("applyDanBtn").addEventListener("click",applyDan);
  $("rankText").addEventListener("change",maybeApplyRankTextPreset);
  $("danDesignation").addEventListener("change",applyDan);
  ["beltColor","stripeColor","tips"].forEach(id=>$(id).addEventListener("input",renderPreview));
  $("saveBtn").addEventListener("click",saveCard);
  $("clearBtn").addEventListener("click",()=>clearForm(true));
  $("studyFilter").addEventListener("change",()=>rebuildStudySet());
  $("cardPicker").addEventListener("change",()=>{currentIndex=Number($("cardPicker").value)||0;setFrontSide();renderStudyCard();closeDrawer();});
  $("startSide").addEventListener("change",()=>{setFrontSide();renderStudyCard();});
  $("studyOrder").addEventListener("change",()=>rebuildStudySet());
  $("prevBtn").addEventListener("click",prevCard);$("nextBtn").addEventListener("click",nextCard);
  $("flipBtn").addEventListener("click",flipCard);$("flashcard").addEventListener("click",flipCard);
  $("knowBtn").addEventListener("click",()=>markStatus("mastered"));
  $("practiceBtn").addEventListener("click",()=>markStatus("practice"));
  $("exportBtn").addEventListener("click",exportCards);
  $("importBtn").addEventListener("click",()=>$("importFile").click());
  $("importFile").addEventListener("change",e=>{if(e.target.files[0])importCards(e.target.files[0])});
  setupSwipe();
  if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js");
}
init();
