/* site: renders every non-hero section from content.js on whichever page it is on
   (home, /projects/, /cv/, /about/) and runs the centred project tile.
   Each renderer checks that its container exists, so one script serves all pages. */
(function(){
"use strict";
var C=window.JM_CONTENT,root=document.documentElement;
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var BY={};C.projects.forEach(function(p){BY[p.id]=p});
/* in-progress work joins the projects grid and the tile as text only: status, what it is, stack, code link; never metrics */
var WIP=(C.in_progress||[]).map(function(p){var w={wip:true,period:p.status,spec:[],bars:[],bullets:[]};
  ["id","title","status","tags","blurb","stack","github"].forEach(function(k){w[k]=p[k]});BY[w.id]=w;return w});
var READY={};(C.images.ready||[]).forEach(function(id){READY[id]=true});
var TAGNAME={};Object.keys(C.filter_tag_map).forEach(function(k){TAGNAME[C.filter_tag_map[k]]=k});
var filter="All",query="",seen=false;
var TRACK_PDFS=["embedded","robotics","edge-ai"];

function $(id){return document.getElementById(id)}
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
function periodLabel(p){return p.wip?'<div><span class="status">'+esc(p.status)+'</span></div>':'<div class="label">'+esc(p.period)+'</div>'}
function card(p){
  return '<article class="card rise'+(seen?' in':'')+'">'+media(p,"media")+
    '<div class="cbody">'+periodLabel(p)+
    '<h3><button type="button" class="cbtn" data-id="'+p.id+'" aria-haspopup="dialog">'+esc(p.title)+'</button></h3>'+
    '<p class="blurb">'+esc(p.blurb)+'</p>'+specTable(p)+'<span class="more-hint" aria-hidden="true">Details →</span></div></article>';
}
/* all projects: featured first (fixed order), then the System track order, then anything left */
function allOrdered(){
  var got={},list=[];
  (C.featured||[]).concat(C.tracks.system.order).forEach(function(id){if(!got[id]&&BY[id]){got[id]=1;list.push(BY[id])}});
  C.projects.forEach(function(p){if(!got[p.id])list.push(p)});
  return guard(list);
}

/* ---------- Featured (home) ---------- */
function renderFeatured(){
  var el=$("featGrid");if(!el)return;
  el.innerHTML=(C.featured||[]).map(function(id){return BY[id]}).filter(Boolean).map(card).join("");
  observe(el);
}

/* ---------- Ongoing (home, projects) and Archive (projects) ---------- */
function ongoingHTML(){
  return C.in_progress.map(function(p){
    return '<div class="nowb">'+(READY[p.id]?'<div class="thumb"><img src="'+imgPath(p.id)+'" alt="" loading="lazy" width="1600" height="900"></div>':'')+
      '<div><span class="status">'+esc(p.status)+'</span><h4>'+esc(p.title)+'</h4><p>'+esc(p.blurb)+'</p>'+
      '<ul class="stack">'+p.stack.map(function(s){return '<li>'+esc(s)+'</li>'}).join("")+'</ul>'+
      (p.github?'<a class="lnk" href="'+esc(p.github)+'" target="_blank" rel="noopener">View code on GitHub ↗</a>':'')+'</div></div>';
  }).join("");
}
function renderOngoing(){["ongoing","nowB"].forEach(function(id){var el=$(id);if(el)el.innerHTML=ongoingHTML()})}
function renderArchive(){
  var el=$("arch");if(!el)return;
  el.innerHTML=C.archive.map(function(p){
    return '<div class="arch">'+(READY[p.id]?'<div class="thumb"><img src="'+imgPath(p.id)+'" alt="" loading="lazy" width="1600" height="900"></div>':'<div></div>')+
      '<div><h4>'+esc(p.title)+'</h4><p>'+esc(p.blurb)+'</p>'+(p.github?'<a class="lnk" href="'+esc(p.github)+'" target="_blank" rel="noopener">View code on GitHub ↗</a>':'')+'</div></div>';
  }).join("");
}

/* ---------- Projects page: filter chips + search + grid ---------- */
function renderChips(){
  var el=$("chips");if(!el)return;
  el.innerHTML=["All"].concat(C.filters).map(function(f){return '<button type="button" class="chip" data-f="'+esc(f)+'" aria-pressed="'+(f===filter)+'">'+esc(f)+'</button>'}).join("");
  el.querySelectorAll(".chip").forEach(function(b){b.addEventListener("click",function(){filter=b.dataset.f;renderChips();renderAllGrid()})});
}
function renderAllGrid(){
  var el=$("allGrid");if(!el)return;
  var tag=C.filter_tag_map[filter],q=query.trim().toLowerCase();
  var all=allOrdered().concat(WIP);
  var list=all.filter(function(p){
    if(tag&&p.tags.indexOf(tag)<0)return false;
    if(!q)return true;
    return [p.title,p.blurb,p.period||"",(p.stack||[]).join(" "),(p.tags||[]).map(function(t){return TAGNAME[t]||t}).join(" ")].join(" ").toLowerCase().indexOf(q)>-1;
  });
  /* a filter can pin its own lead order (content.js filter_order); the rest keep the default order */
  var lead=(C.filter_order||{})[tag];
  if(lead){var rank=function(p){var i=lead.indexOf(p.id);return i<0?lead.length:i};
    list=list.map(function(p,i){return [p,i]}).sort(function(a,b){return (rank(a[0])-rank(b[0]))||(a[1]-b[1])}).map(function(x){return x[0]})}
  el.innerHTML=list.length?list.map(card).join(""):'<p class="empty">No projects match that filter or search.</p>';
  var m=$("allMeta");if(m)m.textContent=list.length+" of "+all.length+" projects";
  observe(el);
}
function wireSearch(){
  var q=$("q");if(!q)return;
  q.addEventListener("input",function(){query=q.value;renderAllGrid()});
}

/* ---------- Experience (home timeline: first bullet + More; CV: every bullet) ---------- */
var MON={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
function ym(s){var m=String(s).trim().match(/([A-Za-z]{3})?\s*(\d{4})/);return m?(+m[2])*12+(m[1]&&MON[m[1]]!=null?MON[m[1]]:0):0}
function span(d){var p=d.split(/\s*[–-]\s*/);return {s:ym(p[0]),e:ym(p[1]||p[0])}}
function expItem(x,i,full){
  var head='<li class="rise"><div class="tl-h"><h3>'+esc(x.title)+' <span>· '+esc(x.company)+'</span></h3><span class="when">'+esc(x.dates)+'</span></div>'+
    '<div class="where">'+esc(x.location)+'</div>';
  if(full)return head+'<ul>'+x.bullets.map(function(b){return '<li>'+esc(b)+'</li>'}).join("")+'</ul></li>';
  var first=x.bullets[0],rest=x.bullets.slice(1),rid="xr"+i;
  return head+'<ul>'+(first?'<li>'+esc(first)+'</li>':'')+'</ul>'+
    (rest.length?'<ul class="rest-b" id="'+rid+'" hidden>'+rest.map(function(b){return '<li>'+esc(b)+'</li>'}).join("")+'</ul>'+
      '<button type="button" class="btn morebtn" aria-expanded="false" aria-controls="'+rid+'">More ('+rest.length+')</button>':'')+'</li>';
}
function renderExp(){
  var el=$("exp");if(!el)return;
  var full=el.dataset.full==="1";
  var lead=C.experience.filter(function(x){return x.placement_rule}),main=C.experience.filter(function(x){return !x.placement_rule});
  main.sort(function(a,b){var A=span(a.dates),B=span(b.dates);return (B.e-A.e)||(B.s-A.s)});
  el.innerHTML='<ol class="tl">'+main.map(function(x,i){return expItem(x,i,full)}).join("")+'</ol>'+
    (lead.length?'<div class="label lead-label">Leadership</div><ol class="tl">'+lead.map(function(x,i){return expItem(x,"L"+i,full)}).join("")+'</ol>':'');
  el.querySelectorAll(".morebtn").forEach(function(b){b.addEventListener("click",function(){
    var r=$(b.getAttribute("aria-controls")),open=b.getAttribute("aria-expanded")!=="true";
    r.hidden=!open;b.setAttribute("aria-expanded",String(open));b.textContent=open?"Less":"More ("+r.children.length+")";
  })});
  observe(el);
}

/* ---------- Education, awards, skills, about text ---------- */
function renderEdu(){
  var el=$("edu");if(!el)return;
  el.innerHTML=C.education.map(function(e){
    return '<div class="box rise"><h4>'+esc(e.degree)+'</h4><div class="meta"><span>'+esc(e.school)+'</span><span>'+esc(e.location)+'</span><span>'+esc(e.dates)+'</span>'+(e.gpa?'<span>GPA '+esc(e.gpa)+'</span>':'')+'</div>'+
      (e.courses&&e.courses.length?'<ul class="stack" aria-label="Courses">'+e.courses.map(function(c){return '<li>'+esc(c)+'</li>'}).join("")+'</ul>':'')+'</div>';
  }).join("");
  observe(el);
}
function renderAwards(){var el=$("awards");if(el)el.innerHTML=C.awards.map(function(a){return '<li>'+esc(a)+'</li>'}).join("")}
function renderSkills(){
  document.querySelectorAll("[data-skills]").forEach(function(t){
    t.innerHTML='<tbody>'+Object.keys(C.skills).map(function(k){return '<tr><th scope="row">'+esc(k)+'</th><td>'+C.skills[k].map(esc).join(" · ")+'</td></tr>'}).join("")+'</tbody>';
  });
}

/* ---------- CV page ---------- */
function pdfButtons(cls){
  return TRACK_PDFS.map(function(k){var t=C.tracks[k];
    return '<a class="btn '+cls+'" href="'+esc(t.resume_pdf)+'" target="_blank" rel="noopener">'+esc(t.label)+' resume (PDF) ↓</a>'}).join("");
}
function renderCv(){
  var line=$("cvLine");if(line){var P=C.person;line.textContent=P.degree_line+" · "+P.location+" · "+P.email}
  var pdf=$("cvPdf");if(pdf)pdf.innerHTML=pdfButtons("pdfbtn");
  var pr=$("cvProj");if(!pr)return;
  pr.innerHTML=allOrdered().map(function(p){
    return '<li><button type="button" class="cbtn cvp" data-id="'+p.id+'" aria-haspopup="dialog">'+esc(p.title)+'</button>'+
      '<span class="cvp-meta">'+esc(p.period||"")+'</span><p>'+esc(p.blurb)+'</p></li>';
  }).join("");
}

/* ---------- About page ---------- */
function renderAboutPage(){
  var t=$("aboutText");if(t)t.textContent=C.about;
  var P=C.person;
  var open=$("aboutOpen");if(open)open.textContent=P.contact_intro||"";
  var site=$("aboutSite");if(site)site.textContent=C.about_site||C.hero_hint||"";
  var facts=$("aboutFacts");
  if(facts)facts.innerHTML=[["Based in",P.location],["Degree",P.degree_line],["Works across","Embedded firmware · Robotics · Edge AI"]]
    .map(function(r){return '<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join("");
  var links=$("aboutLinks");
  if(links)links.innerHTML='<a class="btn" href="'+esc(P.github)+'" target="_blank" rel="noopener">GitHub ↗</a>'+
    '<a class="btn" href="'+esc(P.linkedin)+'" target="_blank" rel="noopener">LinkedIn ↗</a>'+
    '<a class="btn" href="mailto:'+esc(P.email)+'">Email</a>'+pdfButtons("pdfbtn");
  var ph=$("aboutPhoto");
  if(ph){
    ph.innerHTML='<span class="mono" aria-hidden="true">JM</span>';
    if(P.photo){var im=new Image();im.alt="Photo of "+P.name;im.decoding="async";
      im.onload=function(){ph.innerHTML="";ph.appendChild(im);ph.classList.add("has")};im.src=P.photo}
  }
}

/* ---------- Contact (home) ---------- */
function handle(u,pre){return pre+u.replace(/\/+$/,"").split("/").pop()}
function renderRes(){
  var el=$("ctRes");if(!el)return;var f=window.JM_FOCUS;
  el.innerHTML=TRACK_PDFS.map(function(k){var t=C.tracks[k];
    return '<a href="'+esc(t.resume_pdf)+'" target="_blank" rel="noopener"'+(k===f?' class="cur" aria-current="true"':'')+'>'+esc(t.label)+'</a>'}).join(" · ");
}
function renderContact(){
  if(!$("ctIntro"))return;
  var P=C.person;
  $("ctIntro").textContent=P.contact_intro||"";
  $("ctGh").href=P.github;$("ctGhH").textContent=handle(P.github,"@");
  $("ctLi").href=P.linkedin;$("ctLiH").textContent=handle(P.linkedin,"in/");
  $("mail").textContent=P.email;$("mailto").href="mailto:"+P.email;
  var mc=$("mailto").closest(".ct-card");mc.classList.add("ct-click");
  mc.addEventListener("click",function(e){if(e.target.closest("#copy")||e.target.closest("a"))return;location.href="mailto:"+P.email});
  renderRes();
  var out=$("copied");
  $("copy").addEventListener("click",function(){
    function ok(){out.textContent="Copied";clearTimeout(out._t);out._t=setTimeout(function(){out.textContent=""},1800)}
    function fallback(){var t=document.createElement("textarea");t.value=P.email;t.setAttribute("readonly","");t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();
      try{document.execCommand("copy");ok()}catch(e){out.textContent="Copy failed"}document.body.removeChild(t)}
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(P.email).then(ok,fallback);else fallback();
  });
}
function renderHint(){var el=$("heroHint");if(el&&C.hero_hint)el.textContent=C.hero_hint}

/* ---------- project tile: centred, dimmed background, × top right ---------- */
var back=$("drBack"),dr=$("drawer"),drBody=$("drBody"),opener=null,closeT=0;
function demoNote(p){
  if(!p.note||p.note.indexOf("Live demo")!==0)return "";
  var m=p.note.match(/^.*?[.)](?=\s|$)/),txt=(m?m[0]:p.note).replace(/^Live demo:\s*/,"");
  var onHome=!!$("hero");
  return '<a class="demo" href="'+(onHome?'#hero':'/#hero')+'"'+(onHome?' data-demo':'')+'><b>Live demo</b>'+esc(txt)+'</a>';
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
  if(!dr)return;var p=BY[id];if(!p)return;opener=btn||null;clearTimeout(closeT);
  drBody.innerHTML=drMedia(p)+
    '<div>'+periodLabel(p)+'<h2 id="drTitle">'+esc(p.title)+'</h2></div>'+
    (p.wip?'<p class="wip-about">'+esc(p.blurb)+'</p>':'')+
    demoNote(p)+specTable(p)+bars(p)+
    (p.bullets&&p.bullets.length?'<ul class="bul">'+p.bullets.map(function(b){return '<li>'+esc(b)+'</li>'}).join("")+'</ul>':'')+
    (p.stack&&p.stack.length?'<div><h3 class="sub">Stack</h3><ul class="stack">'+p.stack.map(function(s){return '<li>'+esc(s)+'</li>'}).join("")+'</ul></div>':'')+
    (p.github?'<a class="btn primary ghb" href="'+esc(p.github)+'" target="_blank" rel="noopener">View code on GitHub ↗</a>':'');
  back.hidden=false;dr.hidden=false;dr.classList.remove("bars-on");root.style.overflow="hidden";
  void dr.offsetWidth;back.classList.add("open");dr.classList.add("open");
  setTimeout(function(){dr.classList.add("bars-on")},reduce?0:260);
  var vid=drBody.querySelector("video");if(vid){var pr=vid.play();if(pr&&pr.catch)pr.catch(function(){})}
  drBody.scrollTop=0;$("drClose").focus({preventScroll:true});
  var a=drBody.querySelector("[data-demo]");if(a)a.addEventListener("click",function(e){e.preventDefault();closeDrawer(false);$("hero").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})});
}
function closeDrawer(refocus){
  if(!dr||dr.hidden)return;
  var vid=drBody.querySelector("video");if(vid)vid.pause();
  back.classList.remove("open");dr.classList.remove("open","bars-on");root.style.overflow="";
  closeT=setTimeout(function(){back.hidden=true;dr.hidden=true;drBody.innerHTML=""},reduce?0:260);
  if(refocus!==false&&opener)opener.focus({preventScroll:true});
}
if(dr){
  $("drClose").addEventListener("click",function(){closeDrawer()});
  back.addEventListener("click",function(){closeDrawer()});
  document.addEventListener("keydown",function(e){
    if(dr.hidden)return;
    if(e.key==="Escape"){e.preventDefault();closeDrawer();return}
    if(e.key==="Tab"){var f=dr.querySelectorAll('a[href],button:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])');if(!f.length)return;
      var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){z.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===z){a.focus();e.preventDefault()}}
  });
  /* a click on a project title, or anywhere on its card, opens the tile */
  document.addEventListener("click",function(e){
    if(!e.target.closest)return;
    var b=e.target.closest(".cbtn");
    if(!b){var c=e.target.closest(".card");if(c&&!e.target.closest("a"))b=c.querySelector(".cbtn")}
    if(b)openDrawer(b.dataset.id,b);
  });
}

/* ---------- rise-in ---------- */
var io="IntersectionObserver"in window&&!reduce?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px"}):null;
function observe(scope){scope.querySelectorAll(".rise:not(.in)").forEach(function(el){if(io)io.observe(el);else el.classList.add("in")})}

root.classList.add("js");
renderFeatured();renderOngoing();renderArchive();renderChips();renderAllGrid();wireSearch();
renderExp();renderEdu();renderAwards();renderSkills();renderCv();renderAboutPage();renderContact();renderHint();
observe(document);
seen=true;
window.addEventListener("jm-focus",function(){renderRes()});
})();
