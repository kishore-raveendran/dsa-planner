const outcomes = {solo:'Solved solo', hint:'Needed a hint', solution:'Studied the solution', stuck:'Still stuck'};
const blockers = {approach:['Finding an approach','Write the brute-force approach and circle the work you repeat.'],code:['Turning the idea into code','Trace your pseudocode line by line on a small input.'],cases:['Handling edge cases','Write the expected result for two boundary cases before running your code.'],complexity:['Improving complexity','Count the work in each loop and look for results you can reuse.']};
const difficulty = {E:'Easy',M:'Medium',H:'Hard'};
const key = 'dsa-planner-v1';
const app = document.querySelector('#app');
const dialog = document.querySelector('#problem');
const byId = Object.fromEntries(problems.map(p=>[p.id,p]));
const esc = value => String(value).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
function dateKey(date = new Date()) {
  return [date.getFullYear(), date.getMonth()+1, date.getDate()].map((part,index)=>String(part).padStart(index===0?4:2,'0')).join('-');
}
function addDays(day, amount) {
  const date = new Date(day+'T12:00:00'); date.setDate(date.getDate()+amount); return dateKey(date);
}
const fmt = (day, options={month:'short',day:'numeric'}) => new Date(day+'T12:00:00').toLocaleDateString('en-IN',options);
const now = () => dateKey();
let state = {attempts:[], notes:{}, plans:{}, time:'19:00'};
try { Object.assign(state, JSON.parse(localStorage.getItem(key)||'{}')); } catch {}
let view='today', selected=now(), month=selected.slice(0,7), revealed=false, query='';
function save() {
  try { localStorage.setItem(key,JSON.stringify(state)); return true; }
  catch { document.querySelector('#storage-error').textContent='Browser storage is unavailable. Changes are kept in memory for this session.'; return false; }
}
const history = id => state.attempts.filter(a=>a.id===id).sort((a,b)=>a.date.localeCompare(b.date)||a.at-b.at);
function review(id) {
  let stage=0, due='';
  for (const a of history(id)) {
    if (a.result!=='solo') {stage=0;due=addDays(a.date,1);continue;}
    if (due && a.date<due && stage>0) continue;
    due=addDays(a.date,[3,7,14][Math.min(stage,2)]);
    stage++;
  }
  return {due,stage};
}
function daily(day, completed=[]) {
  if (state.plans[day]) return state.plans[day];
  const due=problems.map(p=>({p,...review(p.id)})).filter(r=>r.due && r.due<=day && !history(r.p.id).some(a=>a.date===day))
    .sort((a,b)=>a.stage-b.stage||a.due.localeCompare(b.due));
  const fresh=problems.filter(p=>!history(p.id).length);
  const plan=[...completed, ...due.slice(0,Math.max(0,3-completed.length)).map(x=>({id:x.p.id,review:true}))];
  const hasHard=()=>plan.some(x=>byId[x.id].level==='H');
  for (const p of fresh) {
    if (plan.length>=3 || (plan.length>=2 && (hasHard() || p.level!=='E' || plan.some(x=>byId[x.id].level!=='E')))) break;
    plan.push({id:p.id,review:false});
  }
  state.plans[day]=plan; save(); return plan;
}
const heading=(label,title,description)=>`<p class="kicker">${label}</p><h1>${title}</h1><p class="muted">${description}</p>`;
const problemButton=(p)=>`<button class="link" data-id="${p.id}">${p.name}</button>`;
const row=(p,tag)=>`<div class="item"><div>${problemButton(p)}<br><small>${difficulty[p.level]}</small></div><span class="badge">${tag}</span></div>`;
function lessonFor(p) {
  if (!p) return ['Recall the pattern','Say what approach you remember from your last attempt. Trace a small example before you write code.','What should you be able to explain after solving?','Why it works, the edge cases, and the time and space complexity.'];
  const t=p.topic;
  const focused={
    'group-anagrams':['Grouping with a map','A map can associate one key with a list of items. Use a consistent representation so equivalent items land in the same group.','What could act as a common key for “eat” and “tea”?','A sorted copy of either string gives “aet”.'],
    'longest-consecutive-sequence':['Finding runs in a set','A run starts where the previous integer is missing. A set gives fast average-time membership checks.','For the set {1,2,3,8}, where do runs start?','At 1 and 8.'],
    'valid-sudoku':['Checking row, column, and box constraints','Use separate sets to track the digits already seen in each row, column, and 3×3 box.','Which box contains zero-based row 4, column 7?','Box coordinates (1,2), using integer division by 3.'],
    'encode-and-decode-strings':['Encoding boundaries','When joining strings, record enough information to find each boundary, including empty strings and strings containing punctuation.','Why can joining with commas fail?','A comma inside a string is indistinguishable from a separator without extra information.'],
    'product-of-array-except-self':['Prefix and suffix products','A prefix product summarizes items before an index. A suffix product summarizes items after it. The empty product is 1.','For [2,3,4], what are the products before and after index 1?','Before is 2. After is 4.']
  };
  return focused[p.id]||[t.name,t.lesson,t.question,t.answer];
}
function todayView() {
  const day=now(), plan=daily(day), upcoming=plan.find(item=>!item.review);
  const lessons = [...new Map((upcoming ? plan.filter(x=>!x.review).map(x=>lessonFor(byId[x.id])) : [lessonFor()]).map(lesson=>[lesson[0],lesson])).values()];
  const done=plan.filter(x=>history(x.id).some(a=>a.date===day)).length;
  const total=problems.filter(p=>history(p.id).some(a=>a.result==='solo')).length;
  return heading('NeetCode 150','Today’s practice',fmt(day,{weekday:'long',month:'long',day:'numeric'})+' · '+plan.length+' planned attempts')+`
  <div class="grid"><div class="stack"><section class="panel lesson"><p class="kicker">Before you solve · ${upcoming?'10':'5'} min</p>${lessons.map(([title,lesson,question,answer])=>`<section class="concept"><h2>${title}</h2><p>${lesson}</p><p><strong>Quick check</strong> · ${question}</p><details><summary>Check your answer</summary><p>${answer}</p></details></section>`).join('')}<button class="primary" data-action="reveal" aria-expanded="${revealed}">${revealed?'Hide practice queue':'Reveal practice queue'}</button></section>
  ${revealed?`<section class="panel"><h2>Practice queue</h2>${plan.map(x=>row(byId[x.id],history(x.id).some(a=>a.date===day)?'Logged':x.review?'Review':'New')).join('')||'<p>No attempts due today.</p>'}</section>`:''}
  </div><aside class="panel"><h2>Study progress</h2><p>${done} / ${plan.length} planned attempts logged today</p><progress value="${total}" max="${problems.length}" aria-label="Problems solved solo"></progress><p class="muted">${total} / ${problems.length} problems solved solo</p><button data-view="progress">See what to work on</button></aside></div>`;
}
function calendarView() {
  const [year,m]=month.split('-').map(Number), first=new Date(year,m-1,1), days=new Date(year,m,0).getDate();
  const entries=state.attempts.filter(a=>a.date===selected);
  const cells=Array.from({length:days},(_,i)=>{
    const d=month+'-'+String(i+1).padStart(2,'0'), logged=state.attempts.some(a=>a.date===d);
    return `<button data-date="${d}" class="${d===selected?'active':logged?'mark':''}" aria-pressed="${d===selected}" aria-label="${fmt(d)}${logged?', attempts logged':''}">${i+1}</button>`;
  }).join('');
  return heading('Practice history','Calendar','Pick a date to see what you practiced or log an extra attempt.')+`<div class="grid">
  <section class="panel"><div class="row spread"><h2>${first.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</h2><div class="row"><button data-month="-1" aria-label="Previous month">‹</button><button data-month="1" aria-label="Next month">›</button></div></div><div class="month">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>'<small>'+d+'</small>').join('')}${'<span></span>'.repeat(first.getDay())}${cells}</div></section>
  <section class="panel"><h2>${fmt(selected)}</h2><p class="muted">${entries.filter(a=>['solo','hint'].includes(a.result)).length} solves · ${entries.length} attempts</p>${entries.sort((a,b)=>b.at-a.at).map(a=>row(byId[a.id],outcomes[a.result])).join('')||'<p>No attempts logged.</p>'}
  ${selected<=now()?`<label for="extra">Log an extra attempt</label><select id="extra" class="full"><option value="">Choose a problem</option>${problems.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>`:''}</section></div>`;
}
function roadmapView() {
  return heading('NeetCode 150','Roadmap','Browse by topic and open any problem to see its notes or log an attempt.')+`
  <label for="search">Find a problem</label><input id="search" type="search" placeholder="e.g. Two Sum" value="${esc(query)}"><div id="topics" class="stack" style="margin-top:16px">${roadmapRows()}</div>`;
}
function roadmapRows() {
  return topics.map((topic,index)=>{
    const matches=topic.problems.filter(p=>p.name.toLowerCase().includes(query.toLowerCase()));
    if(!matches.length) return '';
    const solved=topic.problems.filter(p=>history(p.id).some(a=>a.result==='solo')).length;
    return `<details class="panel" ${query||index===0?'open':''}><summary>${topic.name} · ${solved}/${topic.problems.length} solved solo</summary>${matches.map(p=>row(p,review(p.id).due?'Review '+fmt(review(p.id).due):'New')).join('')}</details>`;
  }).join('')||'<p>No matching problems.</p>';
}
function progressView() {
  const trouble=problems.filter(p=>{const h=history(p.id);return h.length&&h.at(-1).result!=='solo';});
  const latest=trouble.map(p=>history(p.id).at(-1));
  return heading('Practice insights','Work on next','Review the problems you still need help with and the blockers that recur.')+`
  <div class="grid"><section class="panel"><h2>Problems to revisit</h2>${trouble.map(p=>{
    const a=history(p.id).at(-1), blocker=blockers[a.blocker];
    return `<div>${row(p,outcomes[a.result])}${blocker?`<p class="muted">${blocker[0]} · ${blocker[1]}</p>`:''}</div>`;
  }).join('')||'<p>Problems appear here after you log a result that needed help.</p>'}</section><div class="stack">
  <section class="panel"><h2>Topics needing practice</h2>${topics.map(t=>{
    const count=trouble.filter(p=>p.topic===t).length;
    const tried=t.problems.filter(p=>history(p.id).length).length;
    return count?`<p><strong>${t.name}</strong><br><small>${count} of ${tried} attempted problems still need help</small></p>`:'';
  }).join('')||'<p class="muted">Your attempt history will appear here.</p>'}</section>
  <section class="panel"><h2>Recurring blockers</h2>${Object.entries(blockers).map(([id,[label,tip]])=>{
    const count=latest.filter(a=>a.blocker===id).length;
    return count>=2?`<p><strong>${label} · ${count} problems</strong><br><small>${tip}</small></p>`:'';
  }).join('')||'<p class="muted">A blocker appears here when it affects two or more problems.</p>'}</section></div></div>`;
}
function reminderView() {
  return heading('Daily practice','Reminder','Set up a daily alert in the calendar app you already use.')+`<div class="grid"><section class="panel"><h2>Daily calendar notification</h2>
  <p>Your calendar sends the alert, including when this planner is closed. A reminder is active once you save a repeating event and enable calendar notifications.</p>
  <ol class="reminder-steps"><li>In your calendar app, create an event called <strong>DSA practice</strong>.</li><li>Pick your study time, set it to repeat daily, and add a notification at the start.</li><li>Paste the planner link into the event, then save.</li></ol>
  <div class="row"><a href="https://calendar.google.com/" target="_blank" rel="noopener">Open Google Calendar ↗</a><button type="button" data-action="copy-link">Copy planner link</button></div>
  <p id="reminder-status" class="muted" aria-live="polite"></p>
  <details><summary>Use a calendar file instead</summary><p>The file fills in the daily event and its alert for you. Import it once in your calendar app.</p><label for="time">Study time (IST)</label><input id="time" type="time" required value="${esc(state.time)}"><button data-action="ics">Download calendar file (.ics)</button></details></section><section class="panel"><h2>Data on this browser</h2><p class="muted">Attempts and notes are saved in this browser. Use a backup to transfer your data to another device.</p><div class="row backup-actions"><button type="button" data-action="backup">Export backup</button><button type="button" data-action="import-backup">Import backup</button></div><input type="file" id="backup-file" accept="application/json,.json" hidden><p class="backup-status muted" id="backup-status" role="status"></p></section></div>`;
}
function render() {
  document.querySelectorAll('nav button').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  app.innerHTML={today:todayView,calendar:calendarView,roadmap:roadmapView,progress:progressView,reminder:reminderView}[view]();
}
function refreshPlan() {
  const day = now();
  const completed = (state.plans[day] || []).filter(item => history(item.id).some(a=>a.date===day));
  state.plans = {};
  daily(day, completed);
}
function openProblem(id, day=now(), editIndex=-1, message='') {
  const p=byId[id], h=history(id), solved=h.filter(a=>a.result==='solo'||a.result==='hint');
  const recent=h.at(-1), next=review(id).due;
  const editing=state.attempts[editIndex];
  const href=p.slug?'https://neetcode.io/problems/'+p.slug+'/question?list=neetcode150':'https://neetcode.io/practice/practice/neetcode150';
  dialog.innerHTML=`<div class="row spread"><p class="kicker">${p.topic.name} · ${difficulty[p.level]}</p><button data-action="close" aria-label="Close problem">Close</button></div>
  <div class="stack"><h2 id="problem-title">${p.name}</h2><a href="${href}" target="_blank" rel="noopener">Open ${p.slug?'problem':'problem list'} on NeetCode ↗</a>
  <section class="panel"><h3 id="attempt-heading" tabindex="-1">${editing?'Edit attempt':'Log attempt'}</h3><form id="attempt"><label>Attempt date <input type="date" name="date" required max="${now()}" value="${editing?.date||day}"></label><label>Result <select name="result" required><option value="">Choose outcome</option>${Object.entries(outcomes).map(([value,label])=>`<option value="${value}" ${editing?.result===value?'selected':''}>${label}</option>`).join('')}</select></label>
  <label>What blocked you? <select name="blocker"><option value="">Optional</option>${Object.entries(blockers).map(([value,[label]])=>`<option value="${value}" ${editing?.blocker===value?'selected':''}>${label}</option>`).join('')}</select></label><div class="row"><button class="primary">${editing?'Save changes':'Save attempt'}</button>${editing?'<button type="button" data-cancel-edit>Cancel</button>':''}</div><p id="logged" aria-live="polite">${message}</p></form></section>
  <section class="panel"><label for="rough">Rough work</label><textarea id="rough" data-id="${id}" placeholder="Trace an input, draw with text arrows, or write pseudocode.">${esc(state.notes[id]||'')}</textarea><p id="note-status" class="muted" aria-live="polite">Autosaves in this browser</p></section>
  <section class="panel"><h3>Attempt history</h3><p>${solved.length} solves${next?' · Next review '+fmt(next):''}</p>
  ${recent?.blocker?`<p class="muted">Try next · ${blockers[recent.blocker][1]}</p>`:''}
  ${[...h].reverse().map(a=>{
    const index=state.attempts.indexOf(a);
    const label=fmt(a.date,{day:'numeric',month:'short',year:'numeric'});
    return `<div><div class="item"><div class="task-summary"><strong>${outcomes[a.result]}</strong><br><small>${label}</small></div><div class="attempt-actions"><button type="button" data-edit="${index}" aria-label="Edit ${outcomes[a.result]} on ${label}">Edit</button><button type="button" data-delete="${index}" aria-label="Delete ${outcomes[a.result]} on ${label}">Delete</button></div></div><div class="confirm-delete" id="confirm-${index}" hidden><p>Delete this attempt?</p><div class="row"><button type="button" data-confirm="${index}">Delete attempt</button><button type="button" data-keep="${index}">Keep attempt</button></div></div></div>`;
  }).join('')||'<p class="muted">No attempts yet.</p>'}</section></div>`;
  if(!dialog.open)dialog.showModal();
  if(editing) dialog.querySelector('#attempt-heading').focus();
  if(message) {
    const announcement=dialog.querySelector('#logged');
    announcement.setAttribute('tabindex','-1');
    announcement.focus();
  }
  dialog.onclick=event=>{
    const button=event.target.closest('button');
    if(!button)return;
    if(button.hasAttribute('data-cancel-edit')){openProblem(id,day);dialog.querySelector('#attempt-heading').focus();}
    if(button.dataset.edit!==undefined)openProblem(id,day,Number(button.dataset.edit));
    if(button.dataset.delete!==undefined){
      const confirm=dialog.querySelector('#confirm-'+button.dataset.delete);
      confirm.hidden=false;
      confirm.querySelector('button').focus();
    }
    if(button.dataset.keep!==undefined){
      dialog.querySelector('#confirm-'+button.dataset.keep).hidden=true;
      dialog.querySelector('[data-delete="'+button.dataset.keep+'"]').focus();
    }
    if(button.dataset.confirm!==undefined){
      state.attempts.splice(Number(button.dataset.confirm),1);
      refreshPlan();
      const persisted=save();
      render();openProblem(id,day,-1,persisted?'Attempt deleted.':'Attempt removed for this session.');
    }
  };
  dialog.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();
    const f=new FormData(event.target);
    const attempt={id,date:f.get('date'),result:f.get('result'),blocker:f.get('blocker'),at:editing?.at??Date.now()};
    if(editing){state.attempts[editIndex]=attempt;refreshPlan();}
    else state.attempts.push(attempt);
    const persisted=save();
    render();openProblem(id,f.get('date'),-1,persisted?(editing?'Changes saved.':'Attempt saved.'):'Attempt saved for this session.');
  });
}
function download(name, data, mime) {
  const url=URL.createObjectURL(new Blob([data],{type:mime}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function plannerLink() {
  return location.protocol==='https:'?location.origin+location.pathname:'https://dsa-practice-planner.flourishingcrab4.chatgpt.site';
}
async function copyPlannerLink() {
  const status=document.querySelector('#reminder-status');
  try { await navigator.clipboard.writeText(plannerLink()); status.textContent='Planner link copied.'; }
  catch { status.textContent=plannerLink(); }
}
function reminder() {
  const input=document.querySelector('#time');
  if(!input.reportValidity())return;
  const time=input.value;state.time=time;save();
  const day=now().replaceAll('-',''), start=time.replace(':','')+'00';
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const target=plannerLink();
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DSA Practice Planner//EN','CALSCALE:GREGORIAN','BEGIN:VTIMEZONE','TZID:Asia/Kolkata','BEGIN:STANDARD','DTSTART:19700101T000000','TZOFFSETFROM:+0530','TZOFFSETTO:+0530','TZNAME:IST','END:STANDARD','END:VTIMEZONE','BEGIN:VEVENT','UID:dsa-practice-planner-daily@planner.local','DTSTAMP:'+stamp,'DTSTART;TZID=Asia/Kolkata:'+day+'T'+start,'RRULE:FREQ=DAILY','DURATION:PT30M','SUMMARY:DSA practice','DESCRIPTION:Open today’s DSA practice plan.'+(target?'\\n'+target:''),...(target?['URL:'+target]:[]),'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M','DESCRIPTION:Open today’s DSA practice plan.','END:VALARM','END:VEVENT','END:VCALENDAR'];
  download('dsa-daily-reminder.ics',lines.join('\r\n')+'\r\n','text/calendar;charset=utf-8');
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  if(b.dataset.view){view=b.dataset.view;render();return;}
  if(b.dataset.id){openProblem(b.dataset.id,view==='calendar'&&selected<=now()?selected:now());return;}
  if(b.dataset.date){selected=b.dataset.date;render();return;}
  if(b.dataset.month){
    const date=new Date(month+'-01T12:00:00');date.setMonth(date.getMonth()+Number(b.dataset.month));month=dateKey(date).slice(0,7);selected=month+'-01';render();return;
  }
  if(b.dataset.action==='reveal'){revealed=!revealed;render();app.querySelector('[data-action="reveal"]').focus();}
  if(b.dataset.action==='close')dialog.close();
  if(b.dataset.action==='ics')reminder();
  if(b.dataset.action==='copy-link')copyPlannerLink();
  if(b.dataset.action==='import-backup')document.querySelector('#backup-file').click();
  if(b.dataset.action==='backup')download('dsa-planner-backup.json',JSON.stringify(state,null,2),'application/json');
});
document.addEventListener('input',e=>{
  const input=e.target;
  if(input.id==='rough'){state.notes[input.dataset.id]=input.value;dialog.querySelector('#note-status').textContent=save()?'Saved in this browser':'Kept for this session';}
  if(input.id==='search'){query=input.value.trim();document.querySelector('#topics').innerHTML=roadmapRows();}
});
document.addEventListener('change',async e=>{
  if(e.target.id==='extra'&&e.target.value){openProblem(e.target.value,selected);e.target.value='';}
  if(e.target.id==='backup-file'&&e.target.files[0]){
    const status=document.querySelector('#backup-status');
    try{
      const backup=JSON.parse(await e.target.files[0].text());
      if(!Array.isArray(backup.attempts)||!backup.notes||!backup.attempts.every(a=>byId[a.id]&&outcomes[a.result]&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)&&Number.isFinite(a.at)&&(!a.blocker||blockers[a.blocker])))throw Error();
      const combined=new Map([...backup.attempts,...state.attempts].map(a=>[JSON.stringify([a.id,a.at]),a]));
      state.attempts=[...combined.values()];state.notes={...backup.notes,...state.notes};state.plans={};const persisted=save();
      status.textContent=persisted?'Backup imported. Existing notes were kept.':'Backup imported for this session.';
    }catch{status.textContent='Couldn’t read this backup. Choose a planner JSON file.';}
    finally{e.target.value='';}
  }
});
render();
