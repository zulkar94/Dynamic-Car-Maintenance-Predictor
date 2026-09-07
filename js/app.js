const el = id => document.getElementById(id);
const clock = el('clock');
function tickClock(){
  const d = new Date();
  clock.textContent = d.toLocaleDateString(undefined,{month:'short',day:'2-digit',year:'numeric'}) + '  ' + d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
}
tickClock(); setInterval(tickClock,30000);

const inputs = ['mileage','sinceService','months','fuel','dtcCount'].map(id=>el(id));
const dtcSeverity = el('dtcSeverity');
const profile = el('profile');

const COMPONENT_COSTS = {
  'Oil & filter service':      {cost:80,  hours:1},
  'Brake pads / fluid':        {cost:260, hours:2},
  'Coolant / thermostat':      {cost:180, hours:2},
  'O2 sensor / fuel system':   {cost:340, hours:3},
  'Spark plugs / ignition':    {cost:220, hours:2},
  'Engine / emissions check':  {cost:450, hours:4},
  'Transmission service':      {cost:300, hours:3},
  'Tires / alignment':         {cost:200, hours:1.5},
};

function fmtMiles(v){ return Number(v).toLocaleString() + ' mi'; }

function recalc(){
  const mileage      = +el('mileage').value;
  const sinceService = +el('sinceService').value;
  const months        = +el('months').value;
  const fuel           = +el('fuel').value;
  const dtcCount        = +el('dtcCount').value;
  const severity          = +dtcSeverity.value;
  const profMult            = +profile.value;

  el('mileageVal').textContent = fmtMiles(mileage);
  el('sinceServiceVal').textContent = fmtMiles(sinceService);
  el('monthsVal').textContent = months + ' mo';
  el('fuelVal').textContent = (fuel>0?'+':'') + fuel + '%';
  el('dtcCountVal').textContent = dtcCount;

  // --- factor scores, each 0-1 ---
  const fMileage   = Math.min(sinceService / 5000, 2) / 2;          // interval overrun
  const fTime      = Math.min(months / 9, 1.6) / 1.6;
  const fFuel      = Math.min(Math.max(-fuel,0) / 20, 1.5) / 1.5;
  const fDtc       = Math.min((dtcCount * (0.5+severity*0.5)) / 8, 1);
  const fAge       = Math.min(mileage / 150000, 1) * 0.5;

  let riskRaw = (fMileage*28 + fTime*18 + fFuel*20 + fDtc*28 + fAge*6) * profMult;
  const risk = Math.max(0, Math.min(100, Math.round(riskRaw)));

  // gauge
  const circumference = 251.2;
  const offset = circumference - (risk/100)*circumference;
  el('gaugeArc').style.strokeDashoffset = offset;
  el('gaugeNum').textContent = risk;
  let color, status;
  if(risk < 34){ color='#5fa877'; status='NOMINAL'; }
  else if(risk < 67){ color='#e8a33d'; status='MONITOR'; }
  else { color='#c0392b'; status='ACT SOON'; }
  el('gaugeArc').setAttribute('stroke', color);
  el('gaugeNum').setAttribute('fill', color);
  const gs = el('gaugeStatus'); gs.textContent = status; gs.style.color = color;

  // --- component risk contributions ---
  const comps = [
    {name:'Oil & filter service',     why:'Interval overrun', score: fMileage},
    {name:'Brake pads / fluid',       why:'Mileage + time since service', score: fMileage*0.5 + fTime*0.6},
    {name:'Coolant / thermostat',     why:'Time-based degradation', score: fTime},
    {name:'O2 sensor / fuel system',  why:'Fuel economy drop', score: fFuel},
    {name:'Spark plugs / ignition',   why:'Diagnostic codes', score: fDtc*0.8 + fFuel*0.3},
    {name:'Engine / emissions check', why:'Severe/active codes', score: severity>=2 ? fDtc : fDtc*0.4},
    {name:'Transmission service',     why:'High mileage', score: fAge + fMileage*0.3},
    {name:'Tires / alignment',        why:'Driving profile + mileage', score: fMileage*0.4 + (profMult-1)*0.6},
  ].map(c => ({...c, score: Math.max(0, Math.min(1, c.score * profMult))}))
   .sort((a,b)=>b.score-a.score);

  const compsEl = el('components');
  compsEl.innerHTML = '';
  comps.forEach(c=>{
    const pct = Math.round(c.score*100);
    const color = pct>=60 ? '#c0392b' : pct>=35 ? '#e8a33d' : '#5b8aa3';
    const row = document.createElement('div');
    row.className='comp-row';
    row.innerHTML = `
      <div class="comp-name">${c.name}<span class="why">${c.why}</span></div>
      <div class="comp-bar"><div class="comp-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="comp-pct">${pct}%</div>`;
    compsEl.appendChild(row);
  });

  // --- KPIs ---
  const predicted = comps.filter(c=>c.score >= 0.45);
  const failCount = predicted.length;
  const totalCost = predicted.reduce((s,c)=> s + (COMPONENT_COSTS[c.name]?.cost || 150) * (0.6+c.score*0.6), 0);
  const totalHours = predicted.reduce((s,c)=> s + (COMPONENT_COSTS[c.name]?.hours || 1.5), 0);

  el('kpiFailures').textContent = failCount;
  el('kpiFailuresSub').textContent = failCount===0 ? 'none flagged — next 90 days' : (failCount===1?'component — next 90 days':'components — next 90 days');
  el('kpiCost').textContent = '$' + Math.round(totalCost).toLocaleString();
  el('kpiDowntime').textContent = (Math.round(totalHours*10)/10) + 'h';
}

inputs.forEach(i=>i.addEventListener('input', recalc));
dtcSeverity.addEventListener('change', recalc);
profile.addEventListener('change', recalc);
recalc();
