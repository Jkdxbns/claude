/* Ported verbatim from hero-reference.html; keep logic, numbers and colours in sync with it. */
/* MOVE + COMMAND: robot arm, firmware config, servo scope */

(function(){
"use strict";
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var root=document.documentElement,PI=Math.PI,LINK_MM=105;
var pickToken=0,lastRejected=null,armMoving=false,pq1=0,pq2=0;
var CFG={speed:150,sMin:0,sMax:180,eMin:0,eMax:180},GRIP_OPEN=60,GRIP_CLOSE=10,lastCmd=null,WS=null;window.JM_cfg=CFG;
addEventListener("jm-theme",function(){readColors()});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){readColors()});

var stage=document.getElementById("stage"),cv=document.getElementById("cv"),ctx=cv.getContext("2d");
var W=0,H=0,dpr=1,col={},mono="'IBM Plex Mono', ui-monospace, monospace";
function readColors(){var s=getComputedStyle(root);["fg","muted","line","grid","accent","warm","panel","bg","slate","danger","scr","scr-grid","scr-text","ch1"].forEach(function(k){col[k]=s.getPropertyValue("--"+k).trim()});lastFW="";if(W)buildWS()}

/* ---------- geometry ---------- */
var G={};
function layout(){
  var r=stage.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  G.tableY=H-30;
  G.L1=G.L2=Math.min(W*0.34,(H-88)*0.72);
  G.sx=Math.max(52,W*0.15,G.L1*0.95+10);G.sy=G.tableY-58;
  G.reach=G.L1+G.L2-2;
  G.cube=Math.max(18,Math.round(G.L1*0.15));
  var r2=G.reach-G.cube*1.6,maxDx=Math.sqrt(Math.max(0,r2*r2-Math.pow(G.tableY-G.sy,2)));
  G.binX=Math.min(W-34,G.sx+maxDx-4);
  G.minX=G.sx+30+G.cube*1.2;G.maxX=G.binX-G.cube*2.2;
  G.k=LINK_MM/G.L1;
  pulseSize();buildWS();
}
function baseRect(){return {x:G.sx-26,y:G.sy+10,w:52,h:G.tableY-G.sy-10}}
function rectOf(b){var s=G.cube;return {x:b.x-s/2,y:b.y-s/2,w:s,h:s}}
function inside(x,y,r,p){return x>r.x-p&&x<r.x+r.w+p&&y>r.y-p&&y<r.y+r.h+p}

/* ---------- kinematics ---------- */
function ik(tx,ty){
  var dx=tx-G.sx,dy=G.sy-ty,d=Math.hypot(dx,dy),out=false,lo=Math.abs(G.L1-G.L2)+6;
  if(d>G.reach){dx*=G.reach/d;dy*=G.reach/d;d=G.reach;out=true}
  if(d<lo){var s=lo/(d||1);dx*=s;dy*=s;d=lo}
  var c=(d*d-G.L1*G.L1-G.L2*G.L2)/(2*G.L1*G.L2);c=Math.max(-1,Math.min(1,c));
  var q2=-Math.acos(c),q1=Math.atan2(dy,dx)-Math.atan2(G.L2*Math.sin(q2),G.L1+G.L2*Math.cos(q2));
  return {q1:q1,q2:q2,out:out,c:c,d:d};
}
function pose(q1,q2,grip){
  var ex=G.sx+G.L1*Math.cos(q1),ey=G.sy-G.L1*Math.sin(q1),a=q1+q2;
  var wx=ex+G.L2*Math.cos(a),wy=ey-G.L2*Math.sin(a),ux=Math.cos(a),uy=-Math.sin(a),px=-uy,py=ux,sp=3+grip*9,len=15;
  return {ex:ex,ey:ey,wx:wx,wy:wy,ux:ux,uy:uy,px:px,py:py,
    f:[[wx+px*3,wy+py*3,wx+ux*len+px*sp,wy+uy*len+py*sp],[wx-px*3,wy-py*3,wx+ux*len-px*sp,wy+uy*len-py*sp]]};
}
function heldCenter(P,b){return {x:P.wx+P.ux*b.ga+P.px*b.gb,y:P.wy+P.uy*b.ga+P.py*b.gb}}

/* collision check for one pose; ign = block being grasped, held = block carried */
function collides(q1,q2,grip,ign,held){
  var d1=q1*180/PI;
  var e1=180+q2*180/PI;
  if(d1<CFG.sMin-0.5||d1>CFG.sMax+0.5)return {why:"shoulder "+Math.round(d1)+"° is outside its "+CFG.sMin+"–"+CFG.sMax+"° limit",part:"upper arm",limit:true};
  if(e1<CFG.eMin-0.5||e1>CFG.eMax+0.5)return {why:"elbow "+Math.round(e1)+"° is outside its "+CFG.eMin+"–"+CFG.eMax+"° limit",part:"forearm",limit:true};
  var P=pose(q1,q2,grip);
  var segs=[["upper arm",G.sx,G.sy,P.ex,P.ey,0.14],["forearm",P.ex,P.ey,P.wx,P.wy,0],["gripper"].concat(P.f[0],[0]),["gripper"].concat(P.f[1],[0])];
  var obs=[{name:"the base",r:baseRect()}];
  blocks.forEach(function(b){if(b.state==="table"&&b!==ign&&b!==held)obs.push({name:"block "+b.id,r:rectOf(b),b:b})});
  for(var i=0;i<segs.length;i++){
    var sg=segs[i];
    for(var n=0;n<=14;n++){
      var t=sg[5]+(1-sg[5])*n/14,x=sg[1]+(sg[3]-sg[1])*t,y=sg[2]+(sg[4]-sg[2])*t;
      if(y>G.tableY-3)return {why:sg[0]+" below the table",part:sg[0]};
      if(x<6||x>W-6||y<6)return {why:sg[0]+" leaves the workspace",part:sg[0]};
      for(var o=0;o<obs.length;o++)if(inside(x,y,obs[o].r,3))return {why:sg[0]+" hits "+obs[o].name,part:sg[0],obs:obs[o]};
    }
  }
  if(held){
    var c=heldCenter(P,held),s=G.cube,hr={x:c.x-s/2,y:c.y-s/2,w:s,h:s};
    if(hr.y+hr.h>G.tableY-1)return {why:"carried block hits the table",part:"gripper"};
    for(var o2=0;o2<obs.length;o2++){var r=obs[o2].r;if(hr.x<r.x+r.w&&hr.x+hr.w>r.x&&hr.y<r.y+r.h&&hr.y+hr.h>r.y)return {why:"carried block hits "+obs[o2].name,part:"gripper",obs:obs[o2]}}
  }
  return null;
}

/* ---------- state ---------- */
var A={q1:1.2,q2:-1.6,grip:1},mode="follow",blocks=[],target={x:0,y:0},IK={},hoverBlock=null,activeL=null;
var warnState={until:0,part:null,obs:null},move=null,spawnAt=0,lastUser=performance.now(),pointerIn=false,touch=matchMedia("(hover: none)").matches;
var COLORS=["warm","accent","slate"];

function spawn(){
  var n=W<480?2:3,span=G.maxX-G.minX,step=n>1?span/(n-1):0,DIG=[0,1,2,3,4,5,6,7,8,9].sort(function(){return Math.random()-.5});
  blocks=[];
  for(var i=0;i<n;i++){
    var jit=n>1?(Math.random()-.5)*Math.min(step*0.25,G.cube*0.5):0;
    var bx=G.minX+step*i+jit;
    blocks.push({id:String(DIG[i]),fx:span?(bx-G.minX)/span:0,x:bx,y:G.tableY-G.cube/2,state:"table",alpha:reduce?1:0,c:COLORS[i],vy:0,box:0});
  }
  // keep only blocks the planner can actually pick from the home pose; nudge right if needed
  var save={q1:A.q1,q2:A.q2,grip:A.grip},hs=ik(G.sx+G.L1*1.25,G.sy-G.L1*0.3);A.q1=hs.q1;A.q2=hs.q2;A.grip=1;
  blocks=blocks.filter(function(b){
    for(var tries=0;tries<8;tries++){if(!plan(b).err)return true;b.x=Math.min(G.maxX,b.x+G.cube*0.5);b.fx=span?(b.x-G.minX)/span:0}
    return false;
  });
  A.q1=save.q1;A.q2=save.q2;A.grip=save.grip;markDigits();
}

function setLayer(l){activeL=l}
function tx(cmd,note,err){if(window.JM_flashCmd&&cmd!=="idle"&&cmd!=="—")JM_flashCmd(!!err);var b=document.getElementById("txCmd");b.textContent=cmd;b.classList.toggle("err",!!err);document.getElementById("txNote").textContent=note||"115200 8N1"}
function warn(c,title,ms){
  /* site port: a held message (PICK REJECTED, NO TARGET) is not replaced by a transient follow-mode warning until it expires */
  if(!ms&&warnState.hold&&performance.now()<warnState.until)return;
  warnState.hold=(ms||0)>=1800;
  warnState.until=performance.now()+(ms||450);warnState.part=c.part||null;warnState.obs=c.obs||null;
  document.getElementById("warnT").textContent=title||(c.limit?"JOINT LIMIT · CANNOT MOVE":"COLLISION WARNING · CANNOT MOVE");
  document.getElementById("warnWhy").textContent=c.why;
  document.getElementById("warn").classList.add("on");
}

/* ---------- planning a pick ---------- */
function lerpQ(a,b,t){return {q1:a.q1+(b.q1-a.q1)*t,q2:a.q2+(b.q2-a.q2)*t}}
function planFrom(b,start){
  var s=G.cube,top=b.y-s/2;
  var wps=[{x:b.x,y:top-58},{x:b.x,y:top-14,grasp:true},{grip:0},{x:b.x,y:top-100,held:true},{x:G.binX,y:G.tableY-s*3.6,held:true,carry:true},{grip:1}];
  var cur=start?{q1:start.q1,q2:start.q2}:{q1:A.q1,q2:A.q2},grip=start?1:A.grip,steps=[];
  for(var i=0;i<wps.length;i++){
    var wp=wps[i];
    if(wp.x===undefined){grip=wp.grip;steps.push({type:"grip",v:wp.grip});continue}
    if(wp.carry){
      /* aim the held block, not the wrist: iterate the wrist target until the block's centre sits right above
         the bin centre with its bottom clear of the bin walls, so it drops straight down */
      var tx=wp.x,ty=wp.y,clearY=G.tableY-G.cube*1.3-G.cube/2-10;
      for(var it=0;it<6;it++){var s0=ik(tx,ty),hc=heldCenter(pose(s0.q1,s0.q2,0),b);tx-=hc.x-G.binX;ty-=Math.max(0,hc.y-clearY)}
      wp.x=tx;wp.y=ty;
    }
    var sol=ik(wp.x,wp.y);
    if(sol.out)return {err:{why:"block "+b.id+" is out of reach"}};
    if(wp.grasp){var P=pose(sol.q1,sol.q2,grip);b.ga=(b.x-P.wx)*P.ux+(b.y-P.wy)*P.uy;b.gb=(b.x-P.wx)*P.px+(b.y-P.wy)*P.py}
    for(var n=1;n<=24;n++){
      var q=lerpQ(cur,sol,n/24),c=collides(q.q1,q.q2,grip,b,wp.held?b:null);
      if(c){c.why="path blocked: "+c.why;return {err:c}}
    }
    var dq=Math.max(Math.abs(sol.q1-cur.q1),Math.abs(sol.q2-cur.q2));
    steps.push({type:"move",q1:sol.q1,q2:sol.q2,dur:Math.max(150,dq*180/PI/CFG.speed*1000),wx:wp.x,wy:wp.y});
    cur={q1:sol.q1,q2:sol.q2};
  }
  return {steps:steps};
}

function homeQ(){var s=ik(G.sx+G.L1*1.25,G.sy-G.L1*0.3),c=clampLim(s);return c?{q1:c.q1,q2:c.q2}:{q1:s.q1,q2:s.q2}}
function pathErr(a,b,grip){for(var n=1;n<=24;n++){var q=lerpQ(a,b,n/24),c=collides(q.q1,q.q2,grip,null,null);if(c)return c}return null}
function plan(b){
  var p=planFrom(b,null);if(!p.err)return p;
  var h=homeQ(),p2=planFrom(b,h);if(p2.err||pathErr({q1:A.q1,q2:A.q2},h,A.grip))return p;
  var dq=Math.max(Math.abs(h.q1-A.q1),Math.abs(h.q2-A.q2));
  p2.steps.unshift({type:"move",q1:h.q1,q2:h.q2,dur:Math.max(150,dq*180/PI/CFG.speed*1000),wx:G.sx+G.L1*1.25,wy:G.sy-G.L1*0.3,home:true});
  return p2;
}
function armLocked(){var p=document.getElementById("p-arm");return !!(p&&p.classList.contains("locked"))}
function retryAttn(on){var e=document.getElementById("retryBtn");if(e)e.classList.toggle("attn",!!on)}
function retry(){
  pickToken++;move=null;mode="reset";hoverBlock=null;warnState.until=0;document.getElementById("warn").classList.remove("on");
  blocks.forEach(function(o){if(o.state==="held"){o.state="falling";o.vy=0}o.target=false});
  setLayer("fw");tx("home\\n","re-home all joints");gripTo(1,150,function(){});
  var h=homeQ(),dq=Math.max(Math.abs(h.q1-A.q1),Math.abs(h.q2-A.q2));
  var done=function(){
    mode="follow";setLayer(null);homeTarget();retryAttn(false);lastUser=performance.now();markDigits();
    var b=lastRejected;lastRejected=null;
    if(b&&b.state==="table"){tx("OK\\n","← arduino · homed, retrying block "+b.id);setTimeout(function(){runPick(b)},350)}
    else tx("OK\\n","← arduino · homed");
  };
  if(reduce){A.q1=h.q1;A.q2=h.q2;done();return}
  move={from:{q1:A.q1,q2:A.q2},to:h,t0:performance.now(),dur:Math.max(300,dq*180/PI/CFG.speed*1000),cb:done};
}
function runPick(b){
  if(mode!=="follow"||!b||b.state!=="table")return;
  lastUser=performance.now();
  var p=plan(b);
  if(p.err){
    warn({why:p.err.why+" · press Retry",part:p.err.part,obs:p.err.obs,limit:p.err.limit},p.err.limit?"JOINT LIMIT · PICK REJECTED":"COLLISION WARNING · PICK REJECTED",2600);
    tx("ERR","planner rejected block "+b.id+" · nothing sent",true);setLayer(null);lastRejected=b;retryAttn(true);
    return;
  }
  lastRejected=null;retryAttn(false);var tok=++pickToken;
  mode="pick";hoverBlock=null;stage.classList.remove("over-block");
  blocks.forEach(function(o){o.target=o===b});
  setLayer("ai");tx("—","target: block "+b.id);
  var t0=performance.now();
  (function lock(now){var q=Math.min(1,(now-t0)/(reduce?1:650));b.box=q;if(q<1)requestAnimationFrame(lock);else go(0)})(t0);
  var S=p.steps;
  function go(i){
    if(tok!==pickToken||i>=S.length)return;
    var st=S[i],j=i-(S[0].home?1:0),next=function(){setTimeout(function(){go(i+1)},reduce?30:140)};
    if(st.home){setLayer("fw");tx("home\\n","path from here was blocked · re-home first")}
    if(j===0){setLayer("fw");tx("prepick\\n","pre-grasp over block "+b.id+", gripper 60°")}
    if(j===1){setLayer("rb");tx("pick\\n","descend → close at ToF 25 mm")}
    if(j===5){tx("drop\\n","release over the bin")}
    if(j===3){tx("pick\\n","gripper 10° · lift")}
    if(st.type==="move"){setIK(st.wx,st.wy);moveTo(st,next)}
    else gripTo(st.v,st.v?220:280,function(){if(tok!==pickToken)return;
      if(st.v===0){b.state="held"}
      else{b.state="falling";b.vy=0;markDigits();tx("OK\\n","← arduino · block "+b.id+" in bin");
        setTimeout(function(){mode="follow";setLayer(null);b.target=false;tx("idle");if(!pointerIn)homeTarget()},reduce?40:800)}
      next();
    });
  }
}
function moveTo(st,cb){
  if(reduce){A.q1=st.q1;A.q2=st.q2;cb();return}
  move={from:{q1:A.q1,q2:A.q2},to:{q1:st.q1,q2:st.q2},t0:performance.now(),dur:st.dur,cb:cb};
}
function gripTo(v,ms,cb){
  if(reduce){A.grip=v;cb();return}
  var g0=A.grip,t0=performance.now();
  (function step(now){var q=Math.min(1,(now-t0)/ms);A.grip=g0+(v-g0)*q;if(q<1)requestAnimationFrame(step);else cb()})(t0);
}

/* ---------- pointer ---------- */
function homeTarget(){target.x=G.sx+G.L1*1.25;target.y=G.sy-G.L1*0.3}
function blockAt(x,y){for(var i=0;i<blocks.length;i++){var b=blocks[i];if(b.state==="table"&&inside(x,y,rectOf(b),6))return b}return null}
stage.addEventListener("pointermove",function(e){if(armLocked()){if(pointerIn){pointerIn=false;hoverBlock=null;stage.classList.remove("over-block");homeTarget()}return}
  if(e.pointerType!=="mouse")return;var r=stage.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  pointerIn=true;lastUser=performance.now();
  hoverBlock=mode==="follow"?blockAt(x,y):null;stage.classList.toggle("over-block",!!hoverBlock);var cc=G.cam;stage.classList.toggle("over-cam",!!(cc&&x>cc.x&&x<cc.x+cc.w&&y>cc.y&&y<cc.y+cc.h));
  if(hoverBlock){target.x=hoverBlock.x;target.y=hoverBlock.y-G.cube/2-58}else{target.x=x;target.y=y}
});
stage.addEventListener("pointerleave",function(){pointerIn=false;hoverBlock=null;stage.classList.remove("over-block");if(mode==="follow")homeTarget()});
stage.addEventListener("click",function(e){if(armLocked())return;var r=stage.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,c=G.cam;if(c&&x>c.x&&x<c.x+c.w&&y>c.y&&y<c.y+c.h){if(window.JM_goDeeper)JM_goDeeper("edge-ai");return}runPick(blockAt(x,y))});
if(touch)document.getElementById("hint").textContent="tap a block";

/* ---------- firmware: 3-channel servo PWM scope + config ---------- */
var fsc=document.getElementById("fwScope"),fctx=fsc.getContext("2d"),FW=0,FH=0,lastFW="";
function pulseSize(){var r=fsc.getBoundingClientRect();if(!r.width)return;FW=r.width;FH=r.height;fsc.width=Math.round(FW*dpr);fsc.height=Math.round(FH*dpr);fctx.setTransform(dpr,0,0,dpr,0,0);lastFW=""}
function us(a){return Math.round(544+a*1856/180)}
function clampLim(a){var d1=a.q1*180/PI,e=180+a.q2*180/PI,n1=Math.max(CFG.sMin,Math.min(CFG.sMax,d1)),ne=Math.max(CFG.eMin,Math.min(CFG.eMax,e));
  if(Math.abs(n1-d1)<0.6&&Math.abs(ne-e)<0.6)return null;return {q1:n1*PI/180,q2:(ne-180)*PI/180}}
function buildWS(){
  if(!W||!G.L1)return;WS=document.createElement("canvas");WS.width=Math.round(W);WS.height=Math.round(H);
  var g=WS.getContext("2d");g.fillStyle=col.accent||"#2c6a62";g.globalAlpha=.22;
  for(var a=CFG.sMin;a<=CFG.sMax;a+=2.5)for(var e=Math.max(CFG.eMin,2);e<=Math.min(CFG.eMax,178);e+=2.5){
    var P=pose(a*PI/180,(e-180)*PI/180,1);if(P.wy<G.tableY-4&&P.wy>4&&P.wx>4&&P.wx<W-4)g.fillRect(P.wx-.8,P.wy-.8,1.6,1.6)}
}
function markDigits(){if(window.JM_markDigits)JM_markDigits(blocks.filter(function(b){return b.state==="table"}).map(function(b){return +b.id}))}
function updateFW(){
  var s=Math.max(0,Math.min(180,Math.round(A.q1*180/PI))),e=Math.max(0,Math.min(180,Math.round(180+A.q2*180/PI))),g=Math.round(GRIP_CLOSE+A.grip*(GRIP_OPEN-GRIP_CLOSE));
  var key=[s,e,g,CFG.sMin,CFG.sMax,CFG.eMin,CFG.eMax,col.scr,FW].join("|");
  if(key===lastFW||!FW||!col.scr)return;lastFW=key;
  var c=fctx,w=FW,h=FH,L=Math.min(100,w*0.24),R=Math.min(92,w*0.22),pw=w-L-R,lh=h/3,i;
  var lanes=[["D6","shoulder",s,CFG.sMin,CFG.sMax],["D5","elbow",e,CFG.eMin,CFG.eMax],["D3","gripper",g,GRIP_CLOSE,GRIP_OPEN]];
  c.fillStyle=col.scr;c.fillRect(0,0,w,h);
  c.strokeStyle=col["scr-grid"];c.lineWidth=1;
  for(i=0;i<=10;i++){var gx=Math.round(L+i*pw/10)+.5;c.beginPath();c.moveTo(gx,0);c.lineTo(gx,h);c.stroke()}
  c.font="10.5px "+mono;
  lanes.forEach(function(ln,k){
    var top=k*lh,hi=top+lh*0.24,lo=top+lh*0.76,px=pw/20,x0=L+px,u=us(ln[2]);
    if(k){c.strokeStyle=col["scr-grid"];c.beginPath();c.moveTo(0,Math.round(top)+.5);c.lineTo(w,Math.round(top)+.5);c.stroke()}
    
    c.strokeStyle=col.ch1;c.lineWidth=1.6;c.beginPath();c.moveTo(L,lo);c.lineTo(x0,lo);c.lineTo(x0,hi);c.lineTo(x0+u/1000*px,hi);c.lineTo(x0+u/1000*px,lo);c.lineTo(L+pw,lo);c.stroke();
    c.textAlign="left";c.fillStyle=col["scr-text"];c.fillText(ln[0]+" "+ln[1],8,(hi+lo)/2+4);
    c.textAlign="right";c.fillStyle=col.ch1;c.fillText(String(ln[2]).padStart(3,"0")+"° "+u+" µs",w-8,(hi+lo)/2+4);
  });
  c.textAlign="right";c.fillStyle=col["scr-text"];c.fillText("2 ms/div",L+pw-4,h-4);
}
/* firmware controls: speed + joint limits (dual sliders) */
function fwText(){
  document.getElementById("vSpeed").textContent=CFG.speed+" °/s";
  document.getElementById("vS").textContent=CFG.sMin+"–"+CFG.sMax+"°";
  document.getElementById("vE").textContent=CFG.eMin+"–"+CFG.eMax+"°";
  var n=function(v){return '<span class="n">'+v+'</span>'};
  document.getElementById("fcfg").innerHTML='<span class="c">// joint config the firmware enforces</span>\n'+
    'joint_t shoulder = { .pin = 6, .min = '+n(CFG.sMin)+', .max = '+n(CFG.sMax)+' };\n'+
    'joint_t elbow    = { .pin = 5, .min = '+n(CFG.eMin)+', .max = '+n(CFG.eMax)+' };\n'+
    '#define SLEW_DEG_PER_S   '+n(CFG.speed)+'\n'+
    '#define GRIP_CLOSE_ANGLE '+GRIP_CLOSE+'   <span class="c">// close at ToF 25 mm</span>';
}
function cfgChanged(){buildWS();fwText();lastFW="";lastUser=performance.now()}
var fSpeed=document.getElementById("fSpeed");fSpeed.value=CFG.speed;
fSpeed.addEventListener("input",function(){CFG.speed=+fSpeed.value;cfgChanged()});
function dual(id,get,set){
  var el=document.getElementById(id),th=el.querySelectorAll(".th"),sel=el.querySelector(".sel"),drag=-1;
  function render(){var v=get(),p0=v[0]/180*100,p1=v[1]/180*100;th[0].style.left=p0+"%";th[1].style.left=p1+"%";sel.style.left=p0+"%";sel.style.width=(p1-p0)+"%";
    th[0].setAttribute("aria-valuenow",v[0]);th[1].setAttribute("aria-valuenow",v[1])}
  function val(e){var r=el.getBoundingClientRect();return Math.round(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*36)*5}
  function apply(i,v){var c=get().slice();if(i===0)c[0]=Math.max(0,Math.min(v,c[1]-20));else c[1]=Math.min(180,Math.max(v,c[0]+20));set(c);render();cfgChanged()}
  el.addEventListener("pointerdown",function(e){var v=val(e),c=get();drag=Math.abs(v-c[0])<=Math.abs(v-c[1])?0:1;try{el.setPointerCapture(e.pointerId)}catch(x){}apply(drag,v);e.preventDefault()});
  el.addEventListener("pointermove",function(e){if(drag>=0)apply(drag,val(e))});
  el.addEventListener("pointerup",function(){drag=-1});el.addEventListener("pointercancel",function(){drag=-1});
  th.forEach(function(t,i){t.setAttribute("aria-valuemin","0");t.setAttribute("aria-valuemax","180");
    t.addEventListener("keydown",function(e){var c=get();if(e.key==="ArrowLeft"||e.key==="ArrowDown"){apply(i,c[i]-5);e.preventDefault()}if(e.key==="ArrowRight"||e.key==="ArrowUp"){apply(i,c[i]+5);e.preventDefault()}})});
  render();
}
dual("dS",function(){return [CFG.sMin,CFG.sMax]},function(c){CFG.sMin=c[0];CFG.sMax=c[1]});
dual("dE",function(){return [CFG.eMin,CFG.eMax]},function(c){CFG.eMin=c[0];CFG.eMax=c[1]});
fwText();

/* ---------- drawing ---------- */
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function setIK(x,y){var s=ik(x,y);IK={x:(x-G.sx)*G.k,y:(G.sy-y)*G.k,d:s.d*G.k,c:s.c,out:s.out}}
function drawAll(now){
  if(!W||!col.fg)return;
  var warnOn=now<warnState.until,P=pose(A.q1,A.q2,A.grip);
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle=col.grid;ctx.lineWidth=1;
  for(var gx=0;gx<W;gx+=20){ctx.beginPath();ctx.moveTo(gx+.5,0);ctx.lineTo(gx+.5,G.tableY);ctx.stroke()}
  for(var gy=G.tableY;gy>0;gy-=20){ctx.beginPath();ctx.moveTo(0,gy+.5);ctx.lineTo(W,gy+.5);ctx.stroke()}
  if(WS)ctx.drawImage(WS,0,0,W,H);
  ctx.setLineDash([3,5]);ctx.strokeStyle=col.line;ctx.beginPath();ctx.arc(G.sx,G.sy,G.reach,-PI,0);ctx.stroke();ctx.setLineDash([]);
  // table, hatching below it
  ctx.strokeStyle=col.muted;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,G.tableY+.5);ctx.lineTo(W,G.tableY+.5);ctx.stroke();
  ctx.save();ctx.beginPath();ctx.rect(0,G.tableY+1,W,H-G.tableY);ctx.clip();ctx.strokeStyle=col.grid;ctx.lineWidth=1;
  for(var hx=-H;hx<W;hx+=9){ctx.beginPath();ctx.moveTo(hx,H);ctx.lineTo(hx+H,G.tableY-H+H);ctx.stroke()}
  ctx.restore();
  // bin
  var bw=G.cube*2.2,bh=G.cube*1.3;ctx.strokeStyle=col.muted;ctx.lineWidth=1.2;ctx.beginPath();
  ctx.moveTo(G.binX-bw/2,G.tableY-bh);ctx.lineTo(G.binX-bw/2,G.tableY);ctx.lineTo(G.binX+bw/2,G.tableY);ctx.lineTo(G.binX+bw/2,G.tableY-bh);ctx.stroke();
  ctx.font="10.5px "+mono;ctx.textAlign="center";ctx.fillStyle=col.muted;ctx.fillText("bin",G.binX,G.tableY+18);
  // base
  var br=baseRect(),baseHit=warnOn&&warnState.obs&&warnState.obs.name==="the base";
  ctx.fillStyle=col.panel;ctx.strokeStyle=baseHit?col.danger:col.fg;ctx.lineWidth=1.5;rr(br.x,br.y,br.w,br.h,4);ctx.fill();ctx.stroke();
  ctx.fillStyle=col.muted;ctx.fillText("base · D7",G.sx,G.tableY+18);
  // blocks
  blocks.forEach(function(b){
    if(b.state==="gone")return;
    if(b.state==="held"){var c=heldCenter(P,b);b.x=c.x;b.y=c.y}
    var r=rectOf(b),hit=warnOn&&warnState.obs&&warnState.obs.b===b;
    ctx.globalAlpha=Math.max(0,Math.min(1,b.alpha));ctx.fillStyle=col[b.c];rr(r.x,r.y,r.w,r.h,3);ctx.fill();
    if(hit||b===hoverBlock){ctx.strokeStyle=hit?col.danger:col.fg;ctx.lineWidth=1.5;rr(r.x-3,r.y-3,r.w+6,r.h+6,4);ctx.stroke()}
    ctx.fillStyle=col.panel;ctx.font="500 "+Math.round(G.cube*0.5)+"px "+mono;ctx.textAlign="center";ctx.fillText(b.id,b.x,b.y+G.cube*0.18);
    ctx.globalAlpha=1;
  });
  // arm
  var danger=warnOn&&warnState.part;
  function link(x1,y1,x2,y2,bad){ctx.lineCap="round";ctx.strokeStyle=bad?col.danger:col.fg;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle=col.panel;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  link(G.sx,G.sy,P.ex,P.ey,danger==="upper arm");
  link(P.ex,P.ey,P.wx,P.wy,danger==="forearm");
  ctx.strokeStyle=danger==="gripper"?col.danger:col.fg;ctx.lineWidth=3;
  P.f.forEach(function(f){ctx.beginPath();ctx.moveTo(f[0],f[1]);ctx.lineTo(f[2],f[3]);ctx.stroke()});
  [[G.sx,G.sy],[P.ex,P.ey]].forEach(function(j){ctx.fillStyle=col.panel;ctx.strokeStyle=col.fg;ctx.lineWidth=2;ctx.beginPath();ctx.arc(j[0],j[1],7,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=col.accent;ctx.beginPath();ctx.arc(j[0],j[1],2.5,0,7);ctx.fill()});
  // cursor target
  if(mode==="follow"&&pointerIn){
    var tc=warnOn?col.danger:(IK.out?col.warm:col.accent);
    ctx.strokeStyle=tc;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(target.x,target.y,6,0,7);ctx.moveTo(target.x-10,target.y);ctx.lineTo(target.x+10,target.y);ctx.moveTo(target.x,target.y-10);ctx.lineTo(target.x,target.y+10);ctx.stroke();
  }
  drawCam();drawReadout(warnOn);updateFW();
}
function drawReadout(warnOn){
  var d1=Math.round(A.q1*180/PI),d2=Math.round(A.q2*180/PI),f=function(v,n){var s=(v>=0?"+":"−")+Math.abs(v).toFixed(n||0);return s};
  var status=warnOn?"BLOCKED":(IK.out?"OUT OF REACH":(mode==="pick"?"EXECUTING":"OK"));
  var stc=warnOn?col.danger:(IK.out?col.warm:col.accent);
  var lines=[["IK · elbow-up",col.muted],
    ["x "+f(IK.x||0).padStart(5)+"  y "+f(IK.y||0).padStart(5)+" mm",col.fg],
    ["d "+String(Math.round(IK.d||0)).padStart(4)+" / "+(2*LINK_MM)+" mm",col.fg],
    ["cos θ2 "+f(IK.c||0,3),col.fg],
    ["θ1 "+f(d1).padStart(4)+"°  θ2 "+f(d2).padStart(4)+"°",col.fg],
    [status,stc]];
  ctx.font="10.5px "+mono;
  var w=0;lines.forEach(function(l){w=Math.max(w,ctx.measureText(l[0]).width)});
  var h=lines.length*15+10,c=G.cam||{x:W-160,y:10,w:150,h:93},x,y;
  if(W>=520){x=c.x-w-12-8;y=10}else{x=W-w-12-10;y=c.y+c.h+8}
  ctx.globalAlpha=.9;ctx.fillStyle=col.bg;rr(x,y,w+12,h,5);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=col.line;ctx.lineWidth=1;rr(x,y,w+12,h,5);ctx.stroke();
  ctx.textAlign="left";lines.forEach(function(l,i){ctx.fillStyle=l[1];ctx.fillText(l[0],x+6,y+17+i*15)});
}
function drawCam(){
  var w=Math.min(158,W*0.32),h=64,x=W-w-10,y=10;G.cam={x:x,y:y,w:w,h:h};
  var foc=window.JM_FOCUS==="edge-ai"||activeL==="ai";
  ctx.fillStyle=col.bg;ctx.strokeStyle=foc?col.accent:col.line;ctx.lineWidth=foc?2:1;rr(x,y,w,h,6);ctx.fill();ctx.stroke();
  ctx.font="10px "+mono;ctx.textAlign="left";ctx.fillStyle=col.muted;ctx.fillText("cmd · from Edge AI",x+8,y+15);
  if(lastCmd){
    ctx.font="600 26px "+mono;ctx.fillStyle=col.accent;ctx.fillText(String(lastCmd.d),x+8,y+50);
    ctx.font="10px "+mono;ctx.fillStyle=col.muted;ctx.textAlign="right";
    ctx.fillText(Math.round(lastCmd.conf*100)+"% conf",x+w-8,y+36);
    ctx.fillStyle=lastCmd.ok?col.fg:col.danger;ctx.fillText(lastCmd.ok?"→ block "+lastCmd.d:"no block "+lastCmd.d,x+w-8,y+52);
  }else{ctx.fillStyle=col.muted;ctx.fillText(W<520?"draw a digit ↓":"← draw a digit",x+8,y+44)}
}

/* ---------- loop ---------- */
var last=0,visible=true;
function ease(p){return p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2}
function tick(now){
  var raw=last?(now-last)/1000:0,dt=Math.min(.05,raw);last=now;
  if(move){
    var el=now-move.t0,q=ease(Math.min(1,el/move.dur)),m=lerpQ(move.from,move.to,q);A.q1=m.q1;A.q2=m.q2;
    if(el>=move.dur){var cb=move.cb;move=null;cb()}
  }else if(mode==="follow"){
    setIK(target.x,target.y);
    var s=ik(target.x,target.y),lim=clampLim(A),maxStep=CFG.speed*PI/180*dt;
    if(lim){var l1=lim.q1-A.q1,l2=lim.q2-A.q2,lm=Math.max(Math.abs(l1),Math.abs(l2)),lf=lm>maxStep?maxStep/lm:1;A.q1+=l1*lf;A.q2+=l2*lf;warn({why:"moving back inside the new joint limits",limit:true})}
    else{var d1=s.q1-A.q1,d2=s.q2-A.q2,dm=Math.max(Math.abs(d1),Math.abs(d2)),df=dm>maxStep?maxStep/dm:1,cand={q1:A.q1+d1*df,q2:A.q2+d2*df};
      var c=collides(cand.q1,cand.q2,A.grip,null,null);
      if(c)warn(c);else{A.q1=cand.q1;A.q2=cand.q2}}
  }
  armMoving=!!move||Math.abs(A.q1-pq1)+Math.abs(A.q2-pq2)>0.0015;pq1=A.q1;pq2=A.q2;
  blocks.forEach(function(b){
    if(b.state==="table"&&b.alpha<1)b.alpha=Math.min(1,b.alpha+Math.min(raw,.5)*2.5);
    if(b.state==="falling"){var floor=G.tableY-G.cube/2-2;b.x+=(G.binX-b.x)*Math.min(1,dt*12);b.vy+=dt*1400;b.y=Math.min(floor,b.y+b.vy*dt);if(b.y>=floor){b.alpha-=dt*1.6;if(b.alpha<=0)b.state="gone"}}
  });
  if(now>warnState.until)document.getElementById("warn").classList.remove("on");
  if(mode==="follow"&&!blocks.some(function(b){return b.state==="table"||b.state==="falling"})){
    if(!spawnAt)spawnAt=now+700;else if(now>spawnAt){spawn();lastN=blocks.length;spawnAt=0}
  }
  if(mode==="follow"&&!pointerIn&&visible&&!(window.JM_edge&&JM_edge.busy())&&now-lastUser>(window.JM_FOCUS==="embedded"?1600:9000)){
    var left=blocks.filter(function(b){return b.state==="table"&&b.alpha>=1});
    if(left.length){var pb=left[Math.floor(Math.random()*left.length)];if(window.JM_edge)JM_edge.loadSample(+pb.id,true);else runPick(pb)}
    lastUser=now;
  }
  drawAll(now);
  requestAnimationFrame(tick);
}
if("IntersectionObserver"in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting}).observe(stage);
var lastN=0;
function resize(){
  var had=W;layout();var n=W<480?2:3;
  if(!had||n!==lastN){if(mode==="follow"){spawn();lastN=n}}
  else blocks.forEach(function(b){if(b.state==="table"){b.x=G.minX+b.fx*(G.maxX-G.minX);b.y=G.tableY-G.cube/2}});
  if(mode==="follow"){homeTarget();if(!had){var s=ik(target.x,target.y);A.q1=s.q1;A.q2=s.q2}}
  drawAll(performance.now());
}
window.JM_robot={
  bump:function(){lastUser=performance.now()},
  retry:function(){retry()},
  moving:function(){return armMoving},
  mark:function(){markDigits()},
  pickDigit:function(d,conf){
    lastUser=performance.now();
    var b=blocks.filter(function(x){return x.state==="table"&&x.id===String(d)})[0],out=document.getElementById("cmdOut");
    lastCmd={d:d,conf:conf,ok:!!b};
    if(!b){setLayer("ai");tx("ERR","no block "+d+" on the table",true);warn({why:"no block "+d+" on the table"},"NO TARGET",1800);
      if(out)out.textContent="→ no block "+d+" on the table";setTimeout(function(){if(mode==="follow")setLayer(null)},1400);return}
    if(mode!=="follow"){if(out)out.textContent="→ arm busy, try again";return}
    if(out)out.textContent="→ arm picks block "+d;
    runPick(b);
  }
};
document.getElementById("retryBtn").addEventListener("click",function(){retry()});
readColors();
if(window.ResizeObserver)new ResizeObserver(resize).observe(stage);else{addEventListener("resize",resize);resize()}
requestAnimationFrame(tick);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){lastFW=""});
})();
