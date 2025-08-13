// Local dataset (fallback if AI is not connected)
const DATA=[
 {keys:["sad","down","blue","cry","tears","heartbroken","depressed","grieving","grief","loss","lost"],feeling:"sad / grieving",
  quran:{ar:"فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا • إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",en:"For indeed, with hardship comes ease. Indeed, with hardship comes ease.",ref:"Qur’an 94:5–6"},
  quran2:{ar:"لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",en:"Allah does not burden a soul beyond its capacity.",ref:"Qur’an 2:286"},
  hadith:{en:"Amazing is the affair of the believer...",ar:"عَجَبًا لِأَمْرِ الْمُؤْمِنِ...",ref:"Ṣaḥīḥ Muslim 2999 (paraphrase)"},
  counsel:{by:"Wise Counsel",text:"Give your grief space before Allah... (12:86)",ref:"cf. Qur’an 12:86"},dua:"اللهم آجرني في مصيبتي واخلف لي خيرا منها"},
 {keys:["stressed","overwhelmed","pressure","burnt","burned","burnout","tired","exhausted"],feeling:"stressed / overwhelmed",
  quran:{ar:"أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",en:"Surely, in the remembrance of Allah do hearts find rest.",ref:"Qur’an 13:28"},
  quran2:{ar:"وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ",en:"Seek help through patience and prayer.",ref:"Qur’an 2:45"},
  hadith:{en:"The strong is the one who controls himself when angry.",ar:"لَيْسَ الشَّدِيدُ...",ref:"Bukhārī 6114; Muslim 2609"},
  counsel:{by:"Al-Ghazālī (advice)",text:"Breathe, wuḍū’, two rak‘āt, dhikr—calm the storm.",ref:"adapted from Iḥyā’"},dua:"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"},
 {keys:["worried","worry","anxious","anxiety","fear","afraid","panic","scared","uneasy","uncertain"],feeling:"worried / afraid",
  quran:{ar:"حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",en:"Allah is sufficient for us...",ref:"Qur’an 3:173"},
  quran2:{ar:"إِنَّ ٱللَّهَ مَعَنَا...",en:"Do not grieve; indeed Allah is with us...",ref:"Qur’an 9:40"},
  hadith:{en:"Tie your camel, then trust in Allah.",ar:"اعْقِلْهَا وَتَوَكَّلْ",ref:"Tirmidhī 2517"},
  counsel:{by:"Ibn al-Qayyim (advice)",text:"Act on what you control; entrust outcomes to Allah.",ref:"Madārij (themes)"},
  dua:"اللهم إني أعوذ بك من الهم والحَزَن"}
];
const synonyms=[["anxious","panic","uneasy","nervous"],["sad","down","blue","depressed","grief","grieving","loss"],
["stressed","overwhelmed","burnt","burned","tired","exhausted"],["worried","concerned","afraid","fear","panic"],
["angry","mad","rage","furious","irritated","frustrated"],["grateful","thankful","appreciative","hopeful"],["guilty","shame","regret","repent","sin"]];

function normalize(s){return (s||"").toLowerCase().trim();}
function localFind(input){const s=normalize(input);if(!s)return null;for(const e of DATA){if(e.keys.includes(s))return e;}
 for(const e of DATA){for(const k of e.keys){if(s.includes(k))return e;}}for(const g of synonyms){if(g.some(x=>s.includes(x))){return DATA.find(d=>d.keys.includes(g[0]));}}return null;}

const select=document.querySelector("#feeling-select");
const input=document.querySelector("#feeling-input");
const goBtn=document.querySelector("#go-btn");
const resultWrap=document.querySelector("#results");
const cards=document.querySelector("#cards");
const currentFeeling=document.querySelector("#current-feeling");
const speakAllBtn=document.querySelector("#speak-all");
const stopSpeakBtn=document.querySelector("#stop-speak");
const pep=document.querySelector("#ai-peptalk");
const aiStatus=document.querySelector("#ai-status");
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>run(b.dataset.feel)));
select.addEventListener("change",()=>run(select.value));
goBtn.addEventListener("click",()=>run(input.value));
input.addEventListener("keydown",e=>{if(e.key==="Enter")run(input.value);});

const AI_BASE = (window.API_BASE||'').trim(); // set in config.js by you
const HAS_AI = !!AI_BASE;
updateAIStatus();

async function run(feel){
  if(!HAS_AI){ render(localFind(feel), feel, null); return; }
  try{
    const res = await fetch(`${AI_BASE}${AI_BASE.endsWith('/')?'':'/'}feel`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ input: feel, profile: "despair-not" })
    });
    if(!res.ok) throw new Error("AI endpoint error");
    const ai = await res.json();
    render(ai.mapped || localFind(feel), feel, ai);
  }catch(e){
    console.warn("AI failed, showing local:", e);
    render(localFind(feel), feel, null);
  }
}

function updateAIStatus(){
  if(HAS_AI){
    aiStatus.innerHTML = `✅ <b>AI Assist is connected.</b> (Endpoint: ${AI_BASE.replace(/^https?:\/\//,'')})`;
  } else {
    aiStatus.innerHTML = `⚠️ <b>AI Assist is OFF.</b> To turn it on: edit <code>config.js</code> and set <code>window.API_BASE = 'https://your-vercel-project.vercel.app/api'</code> (or Netlify <code>/.netlify/functions</code>).`;
  }
}

function render(entry, raw, ai){
  const used=entry||{feeling:raw,quran:{en:"No exact match found."},hadith:{en:""},counsel:{text:"Try a nearby word like worried/sad/stressed."},dua:""};
  currentFeeling.textContent=used.feeling; resultWrap.classList.remove("hidden");
  pep.classList.toggle("hidden", !(ai && ai.peptalk)); if(ai && ai.peptalk){ pep.textContent = ai.peptalk; }
  cards.innerHTML = [ sectionCard("Qur’an", used.quran, "📖", "purple"),
    used.quran2?sectionCard("Qur’an", used.quran2, "📖", "purple"):"",
    sectionCard("Hadith", used.hadith, "🕊️", "orange"),
    sectionCard(used.counsel.by||"Wise Counsel", {en:used.counsel.text, ar:"", ref:used.counsel.ref}, "🧭", "green"),
    used.dua?duaCard(used.dua):"" ].join("");
}

function sectionCard(title, obj, icon, color="purple"){
  if(!obj)obj={en:""}; const ar=obj.ar?`<div class="quote-ar">“${obj.ar}”</div>`:"";
  const en=obj.en?`<p class="quote-en">“${obj.en}”</p>`:""; const ref=obj.ref?`<div class="meta">${obj.ref}</div>`:"";
  return `<article class="cardlet"><span class="badge ${color==='orange'?'orange':color==='green'?'green':''}">${icon} ${title}</span>
    ${ar}${ar?'<hr class="sep" />':''}${en}${ref}
    <div class="controls"><button class="ghost" onclick="speakText(\`${(obj.ar||'')+' '+(obj.en||'')}\`)">🔊 Read</button>
    <button class="ghost" onclick="copyText(\`${(obj.ar||'')}\n${(obj.en||'')}\n${obj.ref||''}\`)">📋 Copy</button></div></article>`;
}

function duaCard(text){
  return `<article class="cardlet"><span class="badge green">🤲 Dua</span>
    <div class="quote-ar">“${text}”</div>
    <div class="controls"><button class="ghost" onclick="speakText(\`${text}\`)">🔊 Read</button>
    <button class="ghost" onclick="copyText(\`${text}\`)">📋 Copy</button></div></article>`;
}

function speakText(text){
  if(!('speechSynthesis' in window)){ alert('Speech not supported.'); return; }
  window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text);
  u.rate=0.95; u.pitch=1; speechSynthesis.speak(u);
}
speakAllBtn.addEventListener("click", ()=> {
  const all = Array.from(cards.querySelectorAll(".quote-ar, .quote-en")).map(n=> n.textContent.replace(/[“”]/g,'')).join(". ");
  speakText(all);
});
stopSpeakBtn.addEventListener("click", ()=> speechSynthesis.cancel());
function copyText(text){ navigator.clipboard.writeText(text); }
