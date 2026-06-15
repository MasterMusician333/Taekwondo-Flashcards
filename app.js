
const danOptions = ["None / Color Belt", ...Array.from({length:10},(_,i)=>`${i+1}${suffix(i+1)} Dan`)];
const beltSections = [
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
  {name:"Custom / Other", beltColor:"white", stripeColor:"", tips:""}
];

let currentSet=[], currentIndex=0, currentFront="korean";
const $=id=>document.getElementById(id);

function suffix(n){return n===1?"st":n===2?"nd":n===3?"rd":"th"}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function esc(v){return String(v||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}
function normalizeDan(v){return (!v || v==="None / Color Belt") ? "Color Belt / No Dan" : v}

function normalizeCard(c){
  let dan = c.danDesignation || "";
  let belt = c.beltSection || c.rank || c.dan || "Custom / Other";
  if(/dan/i.test(belt) && !dan){ dan = belt; belt = "Custom / Other"; }
  return {
    id:c.id||uid(),
    korean:c.korean||"",
    english:c.english||"",
    pronunciation:c.pronunciation||"",
    notes:c.notes||"",
    category:c.category||"",
    danDesignation:dan,
    beltSection:belt,
    beltColor:c.beltColor||"white",
    stripeColor:c.stripeColor||"",
    tips:c.tips||"",
    status:c.status||"new"
  };
}
function getCards(){
  const raw = localStorage.getItem("tkdCardsV3") || localStorage.getItem("tkdCardsV23") || localStorage.getItem("tkdCardsV22") || localStorage.getItem("tkdCardsV2") || localStorage.getItem("cards") || "[]";
  try { return JSON.parse(raw).map(normalizeCard); } catch(e) { return []; }
}
function setCards(cards){localStorage.setItem("tkdCardsV3",JSON.stringify(cards.map(normalizeCard)));}

function initOptions(){
  $("danDesignation").innerHTML = danOptions.map(v=>`<option value="${v==="None / Color Belt"?"":v}">${v}</option>`).join("");
  $("beltSectionOptions").innerHTML = beltSections.map(r=>`<option value="${r.name}"></option>`).join("");
  rebuildStudyFilters();
}

function allDanValues(cards=getCards()){
  const base = ["__all","Color Belt / No Dan", ...danOptions.slice(1)];
  const saved = cards.map(c=>normalizeDan(c.danDesignation));
  return [...new Set([...base, ...saved])];
}
function allBeltValues(cards=getCards()){
  const saved = cards.map(c=>c.beltSection).filter(Boolean);
  return [...new Set(["__all", ...beltSections.map(b=>b.name), ...saved])];
}

function rebuildStudyFilters(){
  const cards=getCards();
  const oldDan=$("studyDanFilter").value || "__all";
  const oldBelt=$("studyBeltFilter").value || "__all";
  $("studyDanFilter").innerHTML = allDanValues(cards).map(v=>{
    const label = v==="__all" ? "All Dan / Color Belt Cards" : v;
    return `<option value="${esc(v)}">${esc(label)}</option>`;
  }).join("");
  $("studyBeltFilter").innerHTML = allBeltValues(cards).map(v=>{
    const label = v==="__all" ? "All Belt / Tip Sections" : v;
    return `<option value="${esc(v)}">${esc(label)}</option>`;
  }).join("");
  if([...$("studyDanFilter").options].some(o=>o.value===oldDan)) $("studyDanFilter").value=oldDan;
  if([...$("studyBeltFilter").options].some(o=>o.value===oldBelt)) $("studyBeltFilter").value=oldBelt;
}

function setScreen(name){
  ["study","add","saved","stats"].forEach(s=>$(`${s}Screen`).classList.toggle("active",s===name));
  closeDrawer();
  if(name==="saved") renderGroupedCards();
  if(name==="stats") renderStats();
}
function openDrawer(){$("drawer").classList.add("open");$("drawerShade").classList.add("open");}
function closeDrawer(){$("drawer").classList.remove("open");$("drawerShade").classList.remove("open");}

function applyDan(){
  const dan=$("danDesignation").value;
  if(!dan) return;
  const n=parseInt(dan,10);
  $("beltColor").value="black";
  $("stripeColor").value="";
  $("tips").value=Array(n).fill("yellow").join(",");
  renderPreview();
}
function applyBelt(){
  const preset=beltSections.find(r=>r.name.toLowerCase()===$("beltSection").value.trim().toLowerCase());
  if(!preset) return;
  $("beltColor").value=preset.beltColor;
  $("stripeColor").value=preset.stripeColor;
  $("tips").value=preset.tips;
  renderPreview();
}
function renderPreview(){
  $("beltPreview").innerHTML=beltHtml({beltColor:$("beltColor").value,stripeColor:$("stripeColor").value,tips:$("tips").value});
}
function beltHtml(c){
  let html=`<div class="belt" style="background:${esc(c.beltColor||"white")}">`;
  if(c.stripeColor) html+=`<div class="stripe" style="background:${esc(c.stripeColor)}"></div>`;
  (c.tips||"").split(",").map(x=>x.trim()).filter(Boolean).forEach((tip,i)=>{
    html+=`<div class="tip" style="background:${esc(tip)};right:${i*14}px"></div>`;
  });
  return html+"</div>";
}

function saveCard(){
  const cards=getCards();
  const id=$("editId").value||uid();
  const idx=cards.findIndex(c=>c.id===id);
  const card={
    id,
    korean:$("korean").value.trim(),
    english:$("english").value.trim(),
    pronunciation:$("pronunciation").value.trim(),
    notes:$("notes").value.trim(),
    category:$("category").value.trim(),
    danDesignation:$("danDesignation").value,
    beltSection:$("beltSection").value.trim() || "Custom / Other",
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
  setScreen("saved");
}

function clearForm(clearMessage=true){
  ["editId","korean","english","pronunciation","notes","category","beltSection","tips"].forEach(id=>$(id).value="");
  $("danDesignation").value="";
  $("beltColor").value="white";$("stripeColor").value="";
  renderPreview();
  if(clearMessage)$("saveMessage").textContent="";
}
function editCard(id){
  const c=getCards().find(x=>x.id===id); if(!c)return;
  $("editId").value=c.id; $("korean").value=c.korean; $("english").value=c.english;
  $("pronunciation").value=c.pronunciation; $("notes").value=c.notes; $("category").value=c.category;
  $("danDesignation").value=c.danDesignation||""; $("beltSection").value=c.beltSection||"";
  $("beltColor").value=c.beltColor; $("stripeColor").value=c.stripeColor; $("tips").value=c.tips;
  renderPreview(); setScreen("add");
}
function deleteCard(id){
  if(!confirm("Delete this card?"))return;
  setCards(getCards().filter(c=>c.id!==id)); refreshAll();
}

function filteredCards(){
  const dan=$("studyDanFilter").value, belt=$("studyBeltFilter").value;
  return getCards().filter(c=>{
    const danOk = dan==="__all" || normalizeDan(c.danDesignation)===dan;
    const beltOk = belt==="__all" || (c.beltSection||"Custom / Other")===belt;
    return danOk && beltOk;
  });
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
    $("frontText").textContent="No cards";$("backText").textContent="Add cards or choose another section";
    $("backExtra").textContent="";$("counter").textContent="No cards in this section";return;
  }
  const c=currentSet[currentIndex];
  $("frontBelt").innerHTML=beltHtml(c);$("backBelt").innerHTML=beltHtml(c);
  $("frontText").textContent=currentFront==="korean"?c.korean:c.english;
  $("backText").textContent=currentFront==="korean"?c.english:c.korean;
  const extras=[];
  if(c.pronunciation)extras.push(`Pronunciation: ${c.pronunciation}`);
  if(c.notes)extras.push(c.notes);
  $("backExtra").textContent=extras.join(" • ");
  $("counter").textContent=`Card ${currentIndex+1} of ${currentSet.length} — ${normalizeDan(c.danDesignation)} / ${c.beltSection}`;
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

function renderGroupedCards(){
  const cards=getCards();
  $("cardCountBadge").textContent=cards.length;
  if(!cards.length){$("groupedCardList").innerHTML='<div class="empty-list">No saved cards yet.</div>';return;}
  const byDan={};
  cards.forEach(c=>{
    const dan=normalizeDan(c.danDesignation);
    const belt=c.beltSection||"Custom / Other";
    byDan[dan] ||= {};
    byDan[dan][belt] ||= [];
    byDan[dan][belt].push(c);
  });
  const danOrder=["Color Belt / No Dan",...danOptions.slice(1)];
  const orderedDan=[...danOrder.filter(d=>byDan[d]),...Object.keys(byDan).filter(d=>!danOrder.includes(d)).sort()];
  $("groupedCardList").innerHTML=orderedDan.map(dan=>{
    const belts=byDan[dan];
    const beltOrder=beltSections.map(b=>b.name);
    const orderedBelts=[...beltOrder.filter(b=>belts[b]),...Object.keys(belts).filter(b=>!beltOrder.includes(b)).sort()];
    return `<div class="group"><div class="group-title">${esc(dan)}</div>`+
      orderedBelts.map(belt=>`<div class="subgroup"><div class="subgroup-title">${esc(belt)} (${belts[belt].length})</div>`+
        belts[belt].map(cardHtml).join("")+`</div>`).join("")+
      `</div>`;
  }).join("");
}
function cardHtml(c){
  return `<div class="card-item">
    <strong>${esc(c.korean)} — ${esc(c.english)}</strong>
    <small>${esc(normalizeDan(c.danDesignation))} • ${esc(c.beltSection)} • ${esc(c.category||"No category")} • ${esc(c.status||"new")}</small>
    <div class="card-actions">
      <button class="secondary" onclick="editCard('${c.id}')">Edit</button>
      <button class="warning" onclick="deleteCard('${c.id}')">Delete</button>
    </div>
  </div>`;
}

function renderStats(){
  const cards=getCards();
  if(!cards.length){$("statsContent").innerHTML='<div class="empty-list">No cards yet.</div>';return;}
  $("statsContent").innerHTML =
    `<h3>By Dan</h3><div class="stats-grid">${statCards(groupStats(cards,c=>normalizeDan(c.danDesignation)))}</div>`+
    `<h3>By Belt / Tip Section</h3><div class="stats-grid">${statCards(groupStats(cards,c=>c.beltSection||"Custom / Other"))}</div>`;
}
function groupStats(cards, keyFn){
  const groups={};
  cards.forEach(c=>{const k=keyFn(c);groups[k] ||= [];groups[k].push(c);});
  return groups;
}
function statCards(groups){
  return Object.keys(groups).sort((a,b)=>sortLabel(a).localeCompare(sortLabel(b))).map(name=>{
    const cards=groups[name], total=cards.length;
    const mastered=cards.filter(c=>c.status==="mastered").length;
    const practice=cards.filter(c=>c.status==="practice").length;
    const fresh=total-mastered-practice;
    const mPct=Math.round(mastered/total*100), pPct=Math.round(practice/total*100), fPct=100-mPct-pPct;
    const pie=`conic-gradient(var(--green) 0 ${mPct}%, var(--gold) ${mPct}% ${mPct+pPct}%, var(--gray) ${mPct+pPct}% 100%)`;
    return `<div class="stat-card">
      <h4>${esc(name)} (${total})</h4>
      <div class="pie-row">
        <div class="pie" style="background:${pie}"></div>
        <div class="legend">
          <span><i class="dot green"></i>Know It: ${mastered} (${mPct}%)</span>
          <span><i class="dot gold"></i>Need Practice: ${practice} (${pPct}%)</span>
          <span><i class="dot gray"></i>Unmarked: ${fresh} (${fPct}%)</span>
        </div>
      </div>
    </div>`;
  }).join("");
}
function sortLabel(label){
  if(label==="Color Belt / No Dan") return "00";
  const n=parseInt(label,10);
  return isNaN(n) ? label : String(n).padStart(2,"0");
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
  rebuildStudyFilters();
  rebuildStudySet(keepId);
  renderGroupedCards();
  renderStats();
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
  document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>setScreen(btn.dataset.screen)));
  $("applyDanBtn").addEventListener("click",applyDan);
  $("applyBeltBtn").addEventListener("click",applyBelt);
  $("danDesignation").addEventListener("change",applyDan);
  $("beltSection").addEventListener("change",applyBelt);
  ["beltColor","stripeColor","tips"].forEach(id=>$(id).addEventListener("input",renderPreview));
  $("saveBtn").addEventListener("click",saveCard);
  $("clearBtn").addEventListener("click",()=>clearForm(true));
  ["studyDanFilter","studyBeltFilter","studyOrder"].forEach(id=>$(id).addEventListener("change",()=>rebuildStudySet()));
  $("startSide").addEventListener("change",()=>{setFrontSide();renderStudyCard();});
  $("cardPicker").addEventListener("change",()=>{currentIndex=Number($("cardPicker").value)||0;setFrontSide();renderStudyCard();});
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
