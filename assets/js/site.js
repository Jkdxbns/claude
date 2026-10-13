/* site: renders Selected work, All projects, Experience, About and Contact from content.js,
   re-orders on focus change ("jm-focus"), and runs the project drawer. */
(function(){
"use strict";
var C=window.JM_CONTENT,root=document.documentElement;
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var BY={};C.projects.forEach(function(p){BY[p.id]=p});
var READY={};(C.images.ready||[]).forEach(function(id){READY[id]=true});
var TAGNAME={};Object.keys(C.filter_tag_map).forEach(function(k){TAGNAME[C.filter_tag_map[k]]=k});
var filter="All",seen=false;

function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function imgPath(id){return C.images.path.replace("<id>",id)}
function shortTitle(t){var i=t.indexOf(":");return i>0?t.slice(0,i):t}

/* image or graph-paper placeholder (pending images) */
function media(p,cls){
  if(READY[p.id])return '<div class="'+cls+'"><img src="'+imgPath(p.id)+'" alt="" loading="lazy" decoding="async" width="1600" height="900"></div>';
  return '<div class="'+cls+'"><div class="ph-img"><svg aria-hidden="true"><rect width="100%" height="100%" fill="url(#gp-minor)"/><rect width="100%" height="100%" fill="url(#gp-major)"/></svg><span>'+esc(shortTitle(p.title))+'</span></div></div>';
}
function specTable(p){
  if(!p.spec||!p.spec.length)return "";
  return '<table class="spec"><caption>Characteristics</caption><thead><tr><th scope="col">Parameter</th><th scope="col">Typ</th><th scope="col">Unit</th></tr></thead><tbody>'+
    p.spec.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td></tr>'}).join("")+'</tbody></table>';
}
/* Robocon is never first in any list */
function guard(list){if(list.length>1&&list[0].id==="robocon"){var r=list.shift();list.splice(1,0,r)}return list}
function ordered(){var t=C.tracks[window.JM_FOCUS]||C.tracks[C.default_track];return guard(t.order.map(function(id){return BY[id]}).filter(Boolean))}

/* ---------- Selected work ---------- */
function renderSelected(){
  var list=ordered().slice(0,6),el=document.getElementById("selGrid");
  el.innerHTML=list.map(function(p){
    return '<article class="card rise'+(seen?' in':'')+'">'+media(p,"media")+
      '<div class="cbody"><div class="label">'+esc(p.period)+'</div>'+
      '<h3><button type="button" class="cbtn" data-id="'+p.id+'" aria-haspopup="dialog">'+esc(p.title)+'</button></h3>'+
      '<p class="blurb">'+esc(p.blurb)+'</p>'+specTable(p)+'<span class="more-hint" aria-hidden="true">Details →</span></div></article>';
  }).join("");
  document.getElementById("selMeta").textContent=C.tracks[window.JM_FOCUS].label+" focus · first 6";
  observe(el);
}

/* ---------- All projects ---------- */
function renderChips(){
  var el=document.getElementById("chips");
  el.innerHTML=["All"].concat(C.filters).map(function(f){return '<button type="button" class="chip" data-f="'+esc(f)+'" aria-pressed="'+(f===filter)+'">'+esc(f)+'</button>'}).join("");
  el.querySelectorAll(".chip").forEach(function(b){b.addEventListener("click",function(){filter=b.dataset.f;renderChips();renderAll()})});
}
function renderAll(){
  var tag=C.filter_tag_map[filter],list=guard(ordered().filter(function(p){return !tag||p.tags.indexOf(tag)>-1}));
  var el=document.getElementById("allList");
  el.innerHTML=list.length?list.map(function(p){
    var k=p.spec&&p.spec[0];
    return '<div class="row rise'+(seen?' in':'')+'">'+media(p,"thumb")+
      '<div><div class="label">'+esc(p.period)+'</div><h3><button type="button" class="cbtn" data-id="'+p.id+'" aria-haspopup="dialog">'+esc(p.title)+'</button></h3>'+
      '<div class="tags">'+p.tags.filter(function(t){return TAGNAME[t]}).map(function(t){return '<span>'+esc(TAGNAME[t])+'</span>'}).join("")+'</div></div>'+
      '<div class="key">'+(k?esc(k[0])+' · <b>'+esc(k[1])+'</b>'+(k[2]?' '+esc(k[2]):''):'')+'</div><span class="go" aria-hidden="true">→</span></div>';
  }).join(""):'<p class="empty">No projects with this tag.</p>';
  document.getElementById("allMeta").textContent=list.length+" of "+C.projects.length+" · "+C.tracks[window.JM_FOCUS].label+" order";
  observe(el);
}
function renderLower(){
  document.getElementById("nowB").innerHTML=C.in_progress.map(function(p){
    return '<div class="nowb">'+(READY[p.id]?'<div class="thumb"><img src="'+imgPath(p.id)+'" alt="" loading="lazy" width="1600" height="900"></div>':'')+
      '<div><span class="status">'+esc(p.status)+'</span><h4>'+esc(p.title)+'</h4><p>'+esc(p.blurb)+'</p>'+
      '<ul class="stack">'+p.stack.map(function(s){return '<li>'+esc(s)+'</li>'}).join("")+'</ul>'+
      (p.github?'<a class="lnk" href="'+esc(p.github)+'" target="_blank" rel="noopener">View code on GitHub ↗</a>':'')+'</div></div>';
  }).join("");
  document.getElementById("arch").innerHTML=C.archive.map(function(p){
    return '<div class="arch">'+(READY[p.id]?'<div class="thumb"><img src="'+imgPath(p.id)+'" alt="" loading="lazy" width="1600" height="900"></div>':'<div></div>')+
      '<div><h4>'+esc(p.title)+'</h4><p>'+esc(p.blurb)+'</p>'+(p.github?'<a class="lnk" href="'+esc(p.github)+'" target="_blank" rel="noopener">View code on GitHub ↗</a>':'')+'</div></div>';
  }).join("");
}

/* ---------- drawer ---------- */
var back=document.getElementById("drBack"),dr=document.getElementById("drawer"),drBody=document.getElementById("drBody"),opener=null,closeT=0;
function demoNote(p){
  if(!p.note||p.note.indexOf("Live demo")!==0)return "";
  var m=p.note.match(/^.*?[.)](?=\s|$)/),txt=(m?m[0]:p.note).replace(/^Live demo:\s*/,"");
  return '<a class="demo" href="#hero" data-demo><b>Live demo</b>'+esc(txt)+'</a>';
}
function bars(p){
  if(!p.bars||!p.bars.length)return "";
  return p.bars.map(function(g){
    var vals=g.rows.map(function(r){return r[1]}),max=Math.max.apply(null,vals),best=g.lower_is_better?Math.min.apply(null,vals):max;
    return '<div class="bars"><div class="label">'+esc(g.title)+'</div>'+g.rows.map(function(r){
      return '<div class="brow'+(r[1]===best?' best':'')+'"><span class="bl">'+esc(r[0])+'</span><span class="bt"><i style="--w:'+(r[1]/max*100).toFixed(1)+'%"></i></span><b>'+esc(r[1])+' '+esc(g.unit)+'</b></div>';
    }).join("")+'</div>';
  }).join("");
}
function drMedia(p){
  var v=C.images.videos&&C.images.videos[p.id];
  if(v&&READY[p.id]&&!reduce)return '<div class="media"><video muted loop playsinline preload="none" poster="'+imgPath(p.id)+'" src="'+esc(v)+'" aria-label="'+esc(shortTitle(p.title))+' demo video"></video></div>';
  return media(p,"media");
}
function openDrawer(id,btn){
  var p=BY[id];if(!p)return;opener=btn||null;clearTimeout(closeT);
  drBody.innerHTML=drMedia(p)+
    '<div><div class="label">'+esc(p.period)+'</div><h2 id="drTitle">'+esc(p.title)+'</h2></div>'+
    demoNote(p)+specTable(p)+bars(p)+
    (p.bullets&&p.bullets.length?'<ul class="bul">'+p.bullets.map(function(b){return '<li>'+esc(b)+'</li>'}).join("")+'</ul>':'')+
    (p.stack&&p.stack.length?'<div><h3 class="sub">Stack</h3><ul class="stack">'+p.stack.map(function(s){return '<li>'+esc(s)+'</li>'}).join("")+'</ul></div>':'')+
    (p.github?'<a class="btn primary ghb" href="'+esc(p.github)+'" target="_blank" rel="noopener">View code on GitHub ↗</a>':'');
  back.hidden=false;dr.hidden=false;dr.classList.remove("bars-on");root.style.overflow="hidden";
  void dr.offsetWidth;back.classList.add("open");dr.classList.add("open");
  setTimeout(function(){dr.classList.add("bars-on")},reduce?0:260);
  var vid=drBody.querySelector("video");if(vid){var pr=vid.play();if(pr&&pr.catch)pr.catch(function(){})}
  drBody.scrollTop=0;document.getElementById("drClose").focus({preventScroll:true});
  var a=drBody.querySelector("[data-demo]");if(a)a.addEventListener("click",function(e){e.preventDefault();closeDrawer(false);document.getElementById("hero").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})});
}
function closeDrawer(refocus){
  if(dr.hidden)return;
  var vid=drBody.querySelector("video");if(vid)vid.pause();
  back.classList.remove("open");dr.classList.remove("open","bars-on");root.style.overflow="";
  closeT=setTimeout(function(){back.hidden=true;dr.hidden=true;drBody.innerHTML=""},reduce?0:320);
  if(refocus!==false&&opener)opener.focus({preventScroll:true});
}
document.getElementById("drClose").addEventListener("click",function(){closeDrawer()});
back.addEventListener("click",function(){closeDrawer()});
document.addEventListener("keydown",function(e){
  if(dr.hidden)return;
  if(e.key==="Escape"){e.preventDefault();closeDrawer();return}
  if(e.key==="Tab"){var f=dr.querySelectorAll('a[href],button:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])');if(!f.length)return;
    var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){z.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===z){a.focus();e.preventDefault()}}
});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".cbtn");if(b)openDrawer(b.dataset.id,b)});
/* a click anywhere on a card or row opens it */
["selGrid","allList"].forEach(function(id){document.getElementById(id).addEventListener("click",function(e){
  if(e.target.closest(".cbtn"))return;var c=e.target.closest(".card,.row");if(!c)return;var b=c.querySelector(".cbtn");if(b)openDrawer(b.dataset.id,b)})});

/* ---------- Experience ---------- */
var MON={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
function ym(s){var m=String(s).trim().match(/([A-Za-z]{3})?\s*(\d{4})/);return m?(+m[2])*12+(m[1]&&MON[m[1]]!=null?MON[m[1]]:0):0}
function span(d){var p=d.split(/\s*[–-]\s*/);return {s:ym(p[0]),e:ym(p[1]||p[0])}}
function expItem(x,i){
  var first=x.bullets[0],rest=x.bullets.slice(1),rid="xr"+i;
  return '<li class="rise"><div class="tl-h"><h3>'+esc(x.title)+' <span>· '+esc(x.company)+'</span></h3><span class="when">'+esc(x.dates)+'</span></div>'+
    '<div class="where">'+esc(x.location)+'</div><ul>'+(first?'<li>'+esc(first)+'</li>':'')+'</ul>'+
    (rest.length?'<ul class="rest-b" id="'+rid+'" hidden>'+rest.map(function(b){return '<li>'+esc(b)+'</li>'}).join("")+'</ul>'+
      '<button type="button" class="btn morebtn" aria-expanded="false" aria-controls="'+rid+'">More ('+rest.length+')</button>':'')+'</li>';
}
function renderExp(){
  var lead=C.experience.filter(function(x){return x.placement_rule}),main=C.experience.filter(function(x){return !x.placement_rule});
  main.sort(function(a,b){var A=span(a.dates),B=span(b.dates);return (B.e-A.e)||(B.s-A.s)});
  var el=document.getElementById("exp");
  el.innerHTML='<ol class="tl">'+main.map(expItem).join("")+'</ol>'+
    (lead.length?'<div class="label lead-label">Leadership</div><ol class="tl">'+lead.map(function(x,i){return expItem(x,"L"+i)}).join("")+'</ol>':'');
  el.querySelectorAll(".morebtn").forEach(function(b){b.addEventListener("click",function(){
    var r=document.getElementById(b.getAttribute("aria-controls")),open=b.getAttribute("aria-expanded")!=="true";
    r.hidden=!open;b.setAttribute("aria-expanded",String(open));b.textContent=open?"Less":"More ("+r.children.length+")";
  })});
  observe(el);
}

/* ---------- About, education, awards, skills ---------- */
function renderAbout(){
  document.getElementById("aboutText").textContent=C.about;
  document.getElementById("edu").innerHTML=C.education.map(function(e){
    return '<div class="box rise"><h4>'+esc(e.degree)+'</h4><div class="meta"><span>'+esc(e.school)+'</span><span>'+esc(e.location)+'</span><span>'+esc(e.dates)+'</span>'+(e.gpa?'<span>GPA '+esc(e.gpa)+'</span>':'')+'</div>'+
      (e.courses&&e.courses.length?'<ul class="stack" aria-label="Courses">'+e.courses.map(function(c){return '<li>'+esc(c)+'</li>'}).join("")+'</ul>':'')+'</div>';
  }).join("");
  document.getElementById("awards").innerHTML=C.awards.map(function(a){return '<li>'+esc(a)+'</li>'}).join("");
  document.getElementById("skills").innerHTML='<tbody>'+Object.keys(C.skills).map(function(k){return '<tr><th scope="row">'+esc(k)+'</th><td>'+C.skills[k].map(esc).join(" · ")+'</td></tr>'}).join("")+'</tbody>';
  observe(document.getElementById("about"));
}

/* ---------- Contact ---------- */
function renderContact(){
  var P=C.person;
  document.getElementById("mail").textContent=P.email;
  document.getElementById("mailto").href="mailto:"+P.email;
  document.getElementById("li").href=P.linkedin;document.getElementById("gh").href=P.github;
  document.getElementById("loc").textContent=P.location;
  var out=document.getElementById("copied");
  document.getElementById("copy").addEventListener("click",function(){
    function ok(){out.textContent="Copied";clearTimeout(out._t);out._t=setTimeout(function(){out.textContent=""},1800)}
    function fallback(){var t=document.createElement("textarea");t.value=P.email;t.setAttribute("readonly","");t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();
      try{document.execCommand("copy");ok()}catch(e){out.textContent="Copy failed"}document.body.removeChild(t)}
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(P.email).then(ok,fallback);else fallback();
  });
}

/* ---------- rise-in ---------- */
var io="IntersectionObserver"in window&&!reduce?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px"}):null;
function observe(scope){scope.querySelectorAll(".rise:not(.in)").forEach(function(el){if(io)io.observe(el);else el.classList.add("in")})}

root.classList.add("js");
renderChips();renderSelected();renderAll();renderLower();renderExp();renderAbout();renderContact();
observe(document);
seen=true;
window.addEventListener("jm-focus",function(){renderSelected();renderAll()});
})();
