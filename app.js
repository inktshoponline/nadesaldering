(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO='IntersectionObserver' in window;
  function once(el,fn,th){if(!el)return;if(!hasIO){fn();return}var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){fn();io.disconnect()}},{threshold:th||.2});io.observe(el)}
  function eur(v,d){return '€ '+v.toFixed(d==null?2:d).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
  function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}

  // mobile menu
  var mb=$('.menu-btn'),nav=$('nav.top-nav');
  if(mb&&nav){mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){nav.classList.remove('open');mb.setAttribute('aria-expanded','false')}})}

  // scroll reveal
  var rv=$$('.rv');
  if(rv.length&&hasIO&&!reduce){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});rv.forEach(function(r){io.observe(r)})}
  else rv.forEach(function(r){r.classList.add('in')});

  // countdown to 1 Jan 2027 00:00 Amsterdam (CET = UTC+1)
  var cd=$('#d');
  if(cd){var end=Date.UTC(2026,11,31,23,0,0),el={d:cd,h:$('#h'),m:$('#m'),s:$('#s')};
    var pad=function(n,l){n=String(n);while(n.length<l)n='0'+n;return n};
    var tick=function(){var t=Math.max(0,end-Date.now());el.d.textContent=Math.floor(t/864e5);el.h.textContent=pad(Math.floor(t/36e5)%24,2);el.m.textContent=pad(Math.floor(t/6e4)%60,2);el.s.textContent=pad(Math.floor(t/1e3)%60,2)};
    tick();setInterval(tick,1000)}
  $$('[data-days-left]').forEach(function(e){e.textContent=Math.max(0,Math.ceil((Date.UTC(2026,11,31,23,0,0)-Date.now())/864e5))});

  // hourly price chart: real all-in tariffs (EUR/kWh) from Mark's Zonneplan integration in Home Assistant
  var cv=$('#day');
  if(cv){
    var DAYS=[
      {p:[.3415,.3432,.3358,.3395,.3422,.3467,.3907,.4266,.4504,.4261,.4015,.3770,.3530,.3261,.3498,.3632,.3898,.4190,.4171,.4280,.4004,.3671,.3535,.3287],g:'LLLLLLNHHHNLLLLLNNNHNLLL'},
      {p:[.2737,.2641,.2533,.2408,.2374,.2465,.2698,.3171,.3444,.3106,.2830,.2422,.2316,.2268,.2505,.2911,.3411,.4001,.4479,.4589,.4266,.3982,.3838,.3694],g:'LLLLLLLLNLLLLLLLNNHHHNNN'}];
    var day=1,ctx=cv.getContext('2d'),chips=$$('.chip'),clock=$('#clock'),pnow=$('#pnow'),pg=$('#pgroup');
    var tok=function(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()};
    var sun=function(h){return h<8||h>19?0:Math.pow(Math.sin(Math.PI*(h-8)/11),1.6)};
    var W=640,H=400,L=52,R=14,T=16,B=34,YMIN=.20,YMAX=.50;
    var X=function(h){return L+(W-L-R)*h/24},Y=function(v){return T+(H-T-B)*(1-(v-YMIN)/(YMAX-YMIN))};
    var P=function(h){return DAYS[day].p[Math.min(23,Math.floor(h))]};
    var draw=function(now){
      var D=DAYS[day],ink=tok('--ink'),sunc=tok('--sun'),grid=tok('--grid'),line=tok('--line'),muted=tok('--muted'),i;
      ctx.clearRect(0,0,W,H);ctx.font='11px "JetBrains Mono", monospace';ctx.lineWidth=1;
      for(var v=.20;v<=.501;v+=.10){ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(W-R,Y(v));ctx.stroke();ctx.fillStyle=muted;ctx.textAlign='right';ctx.fillText(eur(v),L-6,Y(v)+4)}
      for(var h=0;h<=24;h+=6){ctx.fillStyle=muted;ctx.textAlign=h===24?'right':h===0?'left':'center';ctx.fillText((h<10?'0':'')+h+':00',X(h),H-12)}
      for(i=0;i<24;i++){if(D.g[i]==='L'){ctx.globalAlpha=.14;ctx.fillStyle=grid;ctx.fillRect(X(i),T,X(i+1)-X(i),H-T-B);ctx.globalAlpha=1}}
      ctx.beginPath();ctx.moveTo(X(0),Y(YMIN));for(i=0;i<=240;i++){var hh=i/10;ctx.lineTo(X(hh),Y(YMIN+sun(hh)*.12))}
      ctx.lineTo(X(24),Y(YMIN));ctx.closePath();ctx.fillStyle=sunc;ctx.globalAlpha=.25;ctx.fill();ctx.globalAlpha=1;
      ctx.beginPath();for(i=0;i<24;i++){ctx[i?'lineTo':'moveTo'](X(i),Y(D.p[i]));ctx.lineTo(X(i+1),Y(D.p[i]))}
      ctx.strokeStyle=ink;ctx.lineWidth=2.5;ctx.stroke();
      ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X(now),T);ctx.lineTo(X(now),H-B);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=ink;ctx.beginPath();ctx.arc(X(now),Y(P(now)),5,0,7);ctx.fill();
      var hr=Math.floor(now),mn=Math.floor((now%1)*60),g=D.g[Math.min(23,hr)];
      clock.textContent=(hr<10?'0':'')+hr+':'+(mn<10?'0':'')+mn;pnow.textContent=eur(P(now));
      pg.textContent=g==='L'?'per kWh · goedkoop':g==='H'?'per kWh · duur':'per kWh';pg.className=g==='L'?'low':g==='H'?'high':'';
      chips.forEach(function(c){c.classList.toggle('on',(c.dataset.on==='low'&&g==='L')||(c.dataset.on==='high'&&g==='H'))});
    };
    // daily all-in gas price (EUR/m3), Zonneplan 'gas tegen dagprijzen', daily mean from Home Assistant, 5 Apr - 16 Oct 2026
    var GAS=[1.402,1.402,1.402,1.417,1.367,1.353,1.339,1.332,1.334,1.360,1.343,1.314,1.309,1.288,1.279,1.282,1.286,1.299,1.314,1.330,1.335,1.335,1.337,1.334,1.329,1.341,1.351,1.348,1.345,1.345,1.348,1.365,1.342,1.326,1.326,1.326,1.328,1.343,1.361,1.365,1.369,1.387,1.393,1.394,1.400,1.416,1.408,1.395,1.380,1.374,1.374,1.375,1.366,1.354,1.360,1.359,1.357,1.355,1.371,1.370,1.377,1.380,1.377,1.377,1.377,1.389,1.387,1.391,1.394,1.368,1.357,1.358,1.328,1.307,1.299,1.290,1.297,1.301,1.301,1.304,1.301,1.293,1.285,1.283,1.283,1.284,1.300,1.317,1.319,1.323,1.332,1.335,1.335,1.332,1.348,1.375,1.391,1.383,1.378,1.379,1.400,1.427,1.446,1.453,1.475,1.484,1.484,1.497,1.510,1.537,1.542,1.551,1.555,1.556,1.515,1.487,1.496,1.505,1.503,1.504,1.505,1.492,1.481,1.446,1.452,1.459,1.459,1.460,1.499,1.509,1.518,1.514,1.521,1.524,1.526,1.536,1.550,1.555,1.572,1.586,1.589,1.589,1.605,1.597,1.581,1.594,1.602,1.603,1.603,1.602,1.641,1.668,1.660,1.650,1.648,1.649,1.668,1.697,1.736,1.772,1.765,1.761,1.762,1.791,1.774,1.754,1.728,1.735,1.740,1.741,1.705,1.675,1.672,1.690,1.665,1.655,1.655,1.669,1.641,1.655,1.678,1.681,1.681,1.683,1.682,1.700,1.720,1.738,1.752,1.755,1.758,1.791,1.829,1.830,1.829,1.843,1.847,1.852,1.856,1.853,1.850],G0=Date.UTC(2026,3,5),mode='power';
    var MN=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
    var gdate=function(i){var d=new Date(G0+i*864e5);return d.getUTCDate()+' '+MN[d.getUTCMonth()]};
    var drawGas=function(f){
      var n=GAS.length,ink=tok('--ink'),sunc=tok('--sun'),grid=tok('--grid'),line=tok('--line'),muted=tok('--muted'),GMIN=1.2,GMAX=1.9,i;
      var gx=function(k){return L+(W-L-R)*k/(n-1)},gy=function(v){return T+(H-T-B)*(1-(v-GMIN)/(GMAX-GMIN))};
      ctx.clearRect(0,0,W,H);ctx.font='11px "JetBrains Mono", monospace';ctx.lineWidth=1;
      for(var v=1.2;v<=1.901;v+=.1){ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(L,gy(v));ctx.lineTo(W-R,gy(v));ctx.stroke();ctx.fillStyle=muted;ctx.textAlign='right';ctx.fillText(eur(v),L-6,gy(v)+4)}
      [[0,'apr'],[26,'mei'],[57,'jun'],[87,'jul'],[118,'aug'],[149,'sep'],[179,'okt']].forEach(function(m){ctx.fillStyle=muted;ctx.textAlign=m[0]?'center':'left';ctx.fillText(m[1],gx(m[0]),H-12)});
      var wp=193;ctx.strokeStyle=grid;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(gx(wp),T);ctx.lineTo(gx(wp),H-B);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=grid;ctx.textAlign='right';ctx.fillText('warmtepomp aan',gx(wp)-6,T+12);
      var upto=Math.max(1,Math.round(f*(n-1)));
      ctx.beginPath();ctx.moveTo(gx(0),gy(GMIN));for(i=0;i<=upto;i++)ctx.lineTo(gx(i),gy(GAS[i]));ctx.lineTo(gx(upto),gy(GMIN));ctx.closePath();ctx.fillStyle=sunc;ctx.globalAlpha=.18;ctx.fill();ctx.globalAlpha=1;
      ctx.beginPath();for(i=0;i<=upto;i++)ctx[i?'lineTo':'moveTo'](gx(i),gy(GAS[i]));ctx.strokeStyle=ink;ctx.lineWidth=2.5;ctx.stroke();
      ctx.fillStyle=ink;ctx.beginPath();ctx.arc(gx(upto),gy(GAS[upto]),5,0,7);ctx.fill();
      clock.textContent=gdate(upto);pnow.textContent=eur(GAS[upto]);pg.textContent='per m³';pg.className='';
    };
    var t0=null,cur=13;
    var loop=function(ts){if(t0===null)t0=ts;var sec=(ts-t0)/1000;if(mode==='gas'){drawGas(Math.min(1,sec/4))}else{cur=(sec*1.4)%24;draw(cur)}requestAnimationFrame(loop)};
    $$('.mode button').forEach(function(b){b.addEventListener('click',function(){mode=b.dataset.mode;t0=null;
      $$('.mode button').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
      $$('[data-for]').forEach(function(e){e.classList.toggle('hide',e.dataset.for!==mode)});
      if(reduce){mode==='gas'?drawGas(1):draw(cur)}})});
    if(reduce)draw(cur);else requestAnimationFrame(loop);
    $$('.days button').forEach(function(b){b.addEventListener('click',function(){day=+b.dataset.day;$$('.days button').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});if(reduce)draw(cur)})});
  }

  // counters
  var counters=$$('[data-count]');
  counters.forEach(function(c){once(c,function(){
    var to=+c.dataset.count,pre=c.dataset.prefix||'',dec=+(c.dataset.dec||0);
    var f=function(v){return pre+(dec?v.toFixed(dec).replace('.',','):fmt(Math.round(v)))};
    if(reduce){c.textContent=f(to);return}
    var s=null;(function step(ts){if(!s)s=ts;var p=Math.min(1,(ts-s)/1200);c.textContent=f(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)})(performance.now());
  },.4)});

  // monthly bars from the 2025/2026 annual bill (kWh)
  var bars=$('#bars');
  if(bars){
    var months=['aug','sep','okt','nov','dec','jan','feb','mrt','apr','mei','jun','jul'],afn=[317,399,599,807,806,841,614,523,400,450,585,518],ter=[355,259,45,0,2,4,5,41,113,224,421,377],max=900,html='';
    for(var k=0;k<12;k++)html+='<div class="m" tabindex="0"><span class="tip">'+months[k]+': '+afn[k]+' af · '+ter[k]+' terug</span><div class="pair"><span class="b a" data-h="'+(afn[k]/max*100)+'"></span><span class="b t" data-h="'+(ter[k]/max*100)+'"></span></div><span class="lbl">'+months[k]+'</span></div>';
    bars.innerHTML=html;
    once(bars,function(){$$('.b',bars).forEach(function(b,i){b.style.transitionDelay=(reduce?0:i*25)+'ms';b.style.height=b.dataset.h+'%'})});
  }

  // stacked flows
  var flows=$('#flows');
  if(flows)once(flows,function(){$$('.seg',flows).forEach(function(s,i){s.style.transitionDelay=(reduce?0:i*120)+'ms';s.style.width=s.dataset.w+'%'})},.25);

  // saldering calculator
  var calc=$('#calc');
  if(calc){
    var EB=0.1108,type='dyn';
    var num=function(id){var v=parseFloat(String($('#'+id).value).replace(/\./g,'').replace(',','.'));return isFinite(v)&&v>0?v:0};
    var num2=function(id){var v=parseFloat(String($('#'+id).value).replace(',','.'));return isFinite(v)&&v>0?v:0};
    var run=function(){
      var terug=num('c-terug'),afn=num('c-afn');
      var gesal=afn?Math.min(terug,afn):terug;
      var perkwh,loss;
      if(type==='dyn'){perkwh=EB}else{perkwh=Math.max(0,num2('c-prijs')-num2('c-verg'))}
      loss=gesal*perkwh;
      $('#o-loss').textContent=eur(loss,0);
      $('#o-gesal').textContent=fmt(Math.round(gesal))+' kWh';
      $('#o-per').textContent=eur(perkwh,Math.abs(perkwh*100-Math.round(perkwh*100))<1e-9?2:4);
      $('#o-month').textContent=eur(loss/12,0);
      $('#o-gauge').style.width=Math.min(100,loss/1000*100)+'%';
      $('#o-cap').classList.toggle('hide',!(afn&&terug>afn));
    };
    $$('#c-type button').forEach(function(b){b.addEventListener('click',function(){type=b.dataset.t;$$('#c-type button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});$$('.only-vast').forEach(function(e){e.classList.toggle('hide',type!=='vast')});$$('.only-dyn').forEach(function(e){e.classList.toggle('hide',type!=='dyn')});run()})});
    $$('input',calc).forEach(function(i){i.addEventListener('input',run)});
    $('#c-mine').addEventListener('click',function(){$('#c-terug').value='1847';$('#c-afn').value='6857';$$('#c-type button')[0].click()});
    run();
  }

  // article: reading progress + toc highlight
  var bar=$('.progress'),art=$('.prose');
  if(bar&&art){var up=function(){var r=art.getBoundingClientRect(),t=r.height-innerHeight;bar.style.width=Math.max(0,Math.min(100,(-r.top)/(t>0?t:1)*100))+'%'};addEventListener('scroll',up,{passive:true});up()}
  var tl=$$('.toc a');
  if(tl.length&&hasIO){var hs=tl.map(function(a){return $(a.getAttribute('href'))}).filter(Boolean);var io3=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){tl.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'0px 0px -70% 0px'});hs.forEach(function(h){io3.observe(h)})}

  // thermostat dial sweep
  var arc=$('#dial-arc');
  if(arc)once(arc,function(){arc.style.strokeDashoffset=arc.dataset.to});
})();

// noodstroom calculator
(function(){
  var n=document.getElementById('nood');if(!n)return;
  var kwh=document.getElementById('n-kwh'),w=document.getElementById('n-w'),sl=document.getElementById('n-slide'),out=document.getElementById('n-out'),g=document.getElementById('n-gauge');
  function val(e){var v=parseFloat(String(e.value).replace(',','.'));return isFinite(v)&&v>0?v:0}
  function run(){var k=val(kwh),ww=val(w),h=ww?k*1000/ww:0;
    out.textContent=h>=48?Math.floor(h/24)+' dagen':h>=1?(Math.round(h*10)/10).toString().replace('.',',')+' uur':Math.round(h*60)+' min';
    g.style.width=Math.min(100,h/24*100)+'%'}
  w.addEventListener('input',function(){sl.value=val(w);run()});
  sl.addEventListener('input',function(){w.value=sl.value;run()});
  kwh.addEventListener('input',run);
  [].forEach.call(document.querySelectorAll('#n-mode button'),function(b){b.addEventListener('click',function(){kwh.value=b.dataset.kwh.replace('.',',');[].forEach.call(document.querySelectorAll('#n-mode button'),function(x){x.setAttribute('aria-pressed',x===b)});run()})});
  run();
})();

// heat cost: gas boiler vs heat pump
(function(){
  var h=document.getElementById('heat');if(!h)return;
  var GAS=1.85,KWHM3=8.8,el=0.3129,cop=4,JAN=123;
  var $=function(i){return document.getElementById(i)};
  function eur(v,d){return '€ '+v.toFixed(d).replace('.',',')}
  function run(){
    var g=GAS/KWHM3,w=el/cop,mx=Math.max(g,w);
    $('h-gas-k').textContent=eur(g,3);$('h-wp-k').textContent=eur(w,3);
    $('h-gas-bar').style.width=(g/mx*100)+'%';$('h-wp-bar').style.width=(w/mx*100)+'%';
    $('h-el-p').textContent=eur(el,2);$('h-cop-t').textContent=$('h-cop-v').textContent=cop.toFixed(1).replace('.',',');
    var d=Math.round((1-w/g)*100);
    $('h-verdict').textContent=Math.abs(d)+'%';$('h-verdict-t').textContent=d>=0?'goedkoper met de warmtepomp':'goedkoper met gas';
    h.classList.toggle('gas-wins',d<0);
    var heat=JAN*KWHM3;$('h-jan-gas').textContent=eur(JAN*GAS,0);$('h-jan-wp').textContent=eur(heat/cop*el,0);
    $('h-break').textContent=(el*KWHM3/GAS).toFixed(1).replace('.',',');
  }
  [].forEach.call(h.querySelectorAll('#h-el button'),function(b){b.addEventListener('click',function(){el=+b.dataset.v;[].forEach.call(h.querySelectorAll('#h-el button'),function(x){x.setAttribute('aria-pressed',x===b)});run()})});
  $('h-cop').addEventListener('input',function(e){cop=+e.target.value;run()});
  run();
})();
