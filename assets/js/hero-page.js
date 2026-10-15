/* page: focus (path folder, ?focus=, #hash), gating, resume link, and live status lights.
   Ported from hero-reference.html; focus text and resume paths come from content.js. */
(function(){
  var C=window.JM_CONTENT,T=C.tracks,FOCI=["system","embedded","robotics","edge-ai"];
  var TITLE={
    "system":"Justin Mascarenhas · Robotics, Firmware & Edge AI",
    "embedded":"Justin Mascarenhas · Embedded Firmware",
    "robotics":"Justin Mascarenhas · Robotics",
    "edge-ai":"Justin Mascarenhas · Edge AI"
  };
  var PANEL={"edge-ai":"p-edge","embedded":"p-fw","robotics":"p-arm"},LMAP={"edge-ai":"ai","embedded":"fw","robotics":"rb"};
  window.JM_FOCUS=C.default_track||"system";
  window.trkHidden=function(){return false};

  /* resolution order: path folder, then ?focus=, then #hash, then the default */
  function resolve(){
    var seg=(location.pathname.split("/").filter(Boolean)[0]||"");
    if(FOCI.indexOf(seg)>-1)return seg;
    var q=null;try{q=new URLSearchParams(location.search).get("focus")}catch(e){}
    if(q&&FOCI.indexOf(q)>-1)return q;
    var h=(location.hash||"").replace("#","");
    if(FOCI.indexOf(h)>-1)return h;
    var d=document.documentElement.getAttribute("data-focus");
    return FOCI.indexOf(d)>-1?d:(C.default_track||"system");
  }

  /* gating: locked panels keep running but take no input; Retry stays enabled everywhere */
  var LOCK={"system":[],"embedded":["p-edge","p-arm"],"edge-ai":["p-arm","p-fw"],"robotics":["p-edge","p-fw"]};
  function applyLocks(f){
    ["p-edge","p-arm","p-fw"].forEach(function(id){
      var p=document.getElementById(id),l=LOCK[f].indexOf(id)>-1;p.classList.toggle("locked",l);
      p.querySelectorAll("button,input").forEach(function(el){if(el.id!=="retryBtn")el.disabled=l});
    });
  }
  function setFocus(f,push){
    if(!T[f])f="system";window.JM_FOCUS=f;
    document.documentElement.setAttribute("data-focus",f);
    document.querySelectorAll(".fsw button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.f===f))});
    document.getElementById("sub").textContent=T[f].sub;
    document.querySelectorAll(".layer").forEach(function(l){l.classList.toggle("focus",LMAP[f]===l.dataset.l)});
    Object.keys(PANEL).forEach(function(k){document.getElementById(PANEL[k]).classList.toggle("focused",k===f)});
    applyLocks(f);
    if(push){
      document.title=TITLE[f];
      var h=(location.hash||"").replace("#","");
      try{history.replaceState(null,"",T[f].path+(h&&FOCI.indexOf(h)<0?"#"+h:""))}catch(err){}
    }
    window.dispatchEvent(new CustomEvent("jm-focus",{detail:f}));
  }
  window.JM_setFocus=function(f){setFocus(f,true)};

  /* layout stability. Sub-text: every focus's sub-text sits invisibly in the same grid cell, so the box is always
     as tall as the longest one at any width and with any font (pure CSS, no measuring). */
  (function(){
    var sub=document.getElementById("sub"),wrap=document.createElement("div");
    wrap.className="subwrap";sub.parentNode.insertBefore(wrap,sub);wrap.appendChild(sub);
    Object.keys(T).forEach(function(k){var g=document.createElement("p");g.className="sum ghost";g.setAttribute("aria-hidden","true");g.textContent=T[k].sub;wrap.appendChild(g)});
  })();

  /* live status lights: Perceive while the network computes, Move while the arm moves, Command flickers on every TX */
  var chipAI=document.querySelector('.layer[data-l="ai"]'),chipFW=document.querySelector('.layer[data-l="fw"]'),chipRB=document.querySelector('.layer[data-l="rb"]');
  (function chainLoop(){
    chipAI.classList.toggle("on",!!(window.JM_edge&&JM_edge.busy()));
    chipRB.classList.toggle("on",!!(window.JM_robot&&JM_robot.moving&&JM_robot.moving()));
    requestAnimationFrame(chainLoop);
  })();
  window.JM_flashCmd=function(err){
    chipFW.classList.remove("flash","err");void chipFW.offsetWidth;chipFW.classList.add("flash");if(err)chipFW.classList.add("err");
    clearTimeout(chipFW._t);chipFW._t=setTimeout(function(){chipFW.classList.remove("flash","err")},460);
  };
  window.JM_goDeeper=function(t){
    var p=document.getElementById(PANEL[t]);if(!p)return;p.scrollIntoView({block:"nearest"});p.classList.add("focused");
    setTimeout(function(){if(window.JM_FOCUS!==t)p.classList.remove("focused")},1400);
  };
  document.querySelectorAll(".fsw button").forEach(function(b){b.addEventListener("click",function(){setFocus(b.dataset.f,true)})});
  document.querySelectorAll(".layer").forEach(function(b){b.addEventListener("click",function(){window.JM_goDeeper(b.dataset.go)})});
  setFocus(resolve(),false);
  /* the Perceive module builds its sample buttons after this script runs: lock them too */
  document.addEventListener("DOMContentLoaded",function(){applyLocks(window.JM_FOCUS)});
})();
