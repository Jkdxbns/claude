/* Ported verbatim from hero-reference.html; keep logic, numbers and colours in sync with it. */
/* PERCEIVE: QAT int8 MLP */

(function(){
"use strict";
var D=window.QAT; /* assets/data/qat-weights.js */
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,root=document.documentElement;
function b64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
var W1=new Int8Array(b64(D.w1).buffer),W2=new Int8Array(b64(D.w2).buffer),SAMPLES=D.samples.map(b64);
var RS=D.in_s*D.s1/D.hs,LS=D.s2*D.hs;

/* ---------- theme ---------- */
var col={};
function readColors(){var s=getComputedStyle(root);["fg","muted","line","grid","accent","warm","panel","bg"].forEach(function(k){col[k]=s.getPropertyValue("--"+k).trim()});drawPad();drawNet()}
addEventListener("jm-theme",readColors);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",readColors);
function rgba(hex,a){var h=hex.replace("#","");if(h.length===3)h=h.split("").map(function(c){return c+c}).join("");var n=parseInt(h,16);return "rgba("+(n>>16&255)+","+(n>>8&255)+","+(n&255)+","+a+")"}


/* ---------- inference (integer path) ---------- */
function infer(x){
  var t0=performance.now(),a1=new Int32Array(64),h=new Uint8Array(64),a2=new Int32Array(10),lg=new Float64Array(10),o,i,s;
  for(o=0;o<64;o++){s=0;for(i=0;i<256;i++)s+=W1[o*256+i]*x[i];a1[o]=s;var v=Math.round(Math.max(s,0)*RS);h[o]=v>255?255:v}
  for(o=0;o<10;o++){s=0;for(i=0;i<64;i++)s+=W2[o*64+i]*h[i];a2[o]=s;lg[o]=s*LS}
  var ms=performance.now()-t0,mx=Math.max.apply(null,lg),ex=Array.prototype.map.call(lg,function(v){return Math.exp(v-mx)}),sum=ex.reduce(function(a,b){return a+b},0);
  var pr=ex.map(function(v){return v/sum}),pred=0;for(o=1;o<10;o++)if(lg[o]>lg[pred])pred=o;
  return {a1:a1,h:h,a2:a2,lg:lg,pr:pr,pred:pred,ms:ms};
}

/* ---------- draw pad ---------- */
var pad=document.getElementById("pad"),padCv=document.getElementById("padCv"),pctx=padCv.getContext("2d");
var ink=document.createElement("canvas"),ictx=ink.getContext("2d"),PS=0,dpr=1,drawing=false,lastPt=null,inkAny=false,procTimer=0;
var showPx=false;  // false: show the ink being drawn; true: show the 16x16 uint8 input the network reads
function sizePad(){
  var r=pad.getBoundingClientRect();if(!r.width)return;dpr=Math.min(devicePixelRatio||1,2);
  var old=document.createElement("canvas");old.width=ink.width;old.height=ink.height;if(ink.width)old.getContext("2d").drawImage(ink,0,0);
  PS=r.width;padCv.width=ink.width=Math.round(PS*dpr);padCv.height=ink.height=Math.round(PS*dpr);
  if(old.width)ictx.drawImage(old,0,0,ink.width,ink.height);else if(curSample!=null)paintSample(SAMPLES[curSample]);
  drawPad();
}
function drawPad(){
  if(!PS||!col.fg)return;
  pctx.setTransform(1,0,0,1,0,0);pctx.clearRect(0,0,padCv.width,padCv.height);
  pctx.strokeStyle=col.grid;pctx.lineWidth=1;var n=8,st=padCv.width/n;
  for(var i=1;i<n;i++){pctx.beginPath();pctx.moveTo(i*st+.5,0);pctx.lineTo(i*st+.5,padCv.height);pctx.moveTo(0,i*st+.5);pctx.lineTo(padCv.width,i*st+.5);pctx.stroke()}
  if(showPx&&X){
    var cs=padCv.width/16;
    for(var k=0;k<256;k++){if(!X[k])continue;pctx.fillStyle=rgba(col.fg,X[k]/255);pctx.fillRect((k%16)*cs,Math.floor(k/16)*cs,cs+.5,cs+.5)}
    if(anim&&anim.phase==="fc1"){var q=anim.cur.i;pctx.strokeStyle=col.warm;pctx.lineWidth=2*dpr;pctx.strokeRect((q%16)*cs+dpr,Math.floor(q/16)*cs+dpr,cs-2*dpr,cs-2*dpr)}
    return;
  }
  // ink is stored as alpha; tint it with the theme colour
  var tmp=document.createElement("canvas");tmp.width=ink.width;tmp.height=ink.height;var t=tmp.getContext("2d");
  t.drawImage(ink,0,0);t.globalCompositeOperation="source-in";t.fillStyle=col.fg;t.fillRect(0,0,tmp.width,tmp.height);
  pctx.drawImage(tmp,0,0);
}
function pt(e){var r=padCv.getBoundingClientRect();return {x:(e.clientX-r.left)*dpr,y:(e.clientY-r.top)*dpr}}
pad.addEventListener("pointerdown",function(e){
  e.preventDefault();pad.setPointerCapture(e.pointerId);drawing=true;lastPt=pt(e);clearTimeout(procTimer);stopAnim();setPx(false);
  if(!inkAny){ictx.clearRect(0,0,ink.width,ink.height)}
  if(window.JM_robot)JM_robot.bump();var co=document.getElementById("cmdOut");if(co)co.textContent="";curSample=null;inkAny=true;document.getElementById("padPh").style.opacity=0;stroke(lastPt,lastPt);
});
pad.addEventListener("pointermove",function(e){if(!drawing)return;var p=pt(e);stroke(lastPt,p);lastPt=p});
function end(){if(!drawing)return;drawing=false;clearTimeout(procTimer);procTimer=setTimeout(fromInk,550)}
pad.addEventListener("pointerup",end);pad.addEventListener("pointercancel",end);
function stroke(a,b){ictx.strokeStyle="#000";ictx.lineCap="round";ictx.lineJoin="round";ictx.lineWidth=ink.width*0.075;ictx.beginPath();ictx.moveTo(a.x,a.y);ictx.lineTo(b.x,b.y);ictx.stroke();drawPad()}
document.getElementById("clear").addEventListener("click",function(){curSample=null;ictx.clearRect(0,0,ink.width,ink.height);inkAny=false;stopAnim();document.getElementById("padPh").style.opacity=1;setInput(null);drawPad();var co=document.getElementById("cmdOut");if(co)co.textContent=""});

/* MNIST-style preprocessing: crop, fit in 20x20, centre by mass in 28x28, then BOX-resample to 16x16 */
function alphaOf(cv,w,h){var d=cv.getContext("2d").getImageData(0,0,w,h).data,a=new Float32Array(w*h);for(var i=0;i<w*h;i++)a[i]=d[i*4+3];return a}
function fromInk(){
  var S=112,c1=document.createElement("canvas");c1.width=c1.height=S;var g=c1.getContext("2d");g.imageSmoothingQuality="high";g.drawImage(ink,0,0,S,S);
  var a=alphaOf(c1,S,S),x0=S,y0=S,x1=-1,y1=-1;
  for(var y=0;y<S;y++)for(var x=0;x<S;x++)if(a[y*S+x]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0){setInput(null);return}
  var bw=x1-x0+1,bh=y1-y0+1,sc=20/Math.max(bw,bh),c2=document.createElement("canvas");c2.width=c2.height=28;var g2=c2.getContext("2d");
  g2.imageSmoothingQuality="high";g2.drawImage(c1,x0,y0,bw,bh,(28-bw*sc)/2,(28-bh*sc)/2,bw*sc,bh*sc);
  var m=alphaOf(c2,28,28),sx=0,sy=0,tot=0;for(var i=0;i<784;i++){var v=m[i];sx+=v*(i%28);sy+=v*Math.floor(i/28);tot+=v}
  var dx=Math.round(13.5-sx/tot),dy=Math.round(13.5-sy/tot),m2=new Float32Array(784);
  for(var yy=0;yy<28;yy++)for(var xx=0;xx<28;xx++){var X=xx-dx,Y=yy-dy;if(X>=0&&X<28&&Y>=0&&Y<28)m2[yy*28+xx]=m[Y*28+X]}
  setInput(box16(m2));run(true);
}
function box16(m){
  var out=new Uint8Array(256),f=28/16;
  for(var oy=0;oy<16;oy++)for(var ox=0;ox<16;ox++){
    var ya=oy*f,yb=ya+f,xa=ox*f,xb=xa+f,s=0;
    for(var y=Math.floor(ya);y<Math.ceil(yb);y++){var wy=Math.min(yb,y+1)-Math.max(ya,y);
      for(var x=Math.floor(xa);x<Math.ceil(xb);x++){var wx=Math.min(xb,x+1)-Math.max(xa,x);s+=m[y*28+x]*wx*wy}}
    out[oy*16+ox]=Math.min(255,Math.round(s/(f*f)));
  }
  return out;
}
var curSample=null;
function paintSample(x){
  var c=document.createElement("canvas");c.width=c.height=16;var g=c.getContext("2d"),im=g.createImageData(16,16);
  for(var i=0;i<256;i++){im.data[i*4+3]=x[i]}g.putImageData(im,0,0);
  ictx.clearRect(0,0,ink.width,ink.height);ictx.imageSmoothingEnabled=true;ictx.imageSmoothingQuality="high";
  var m=ink.width*0.08;if(ink.width)ictx.drawImage(c,m,m,ink.width-2*m,ink.height-2*m);inkAny=true;document.getElementById("padPh").style.opacity=0;drawPad();
}
function loadSample(d,animate){curSample=d;var x=SAMPLES[d];paintSample(x);stopAnim();setInput(x);if(animate)run(true);else finish();}

/* ---------- network view ---------- */
var net=document.getElementById("net"),netCv=document.getElementById("netCv"),nctx=netCv.getContext("2d"),tip=document.getElementById("tip");
var X=null,R=null,L={},mode="parallel";
var P1=new Int32Array(64),P2=new Int32Array(10),HV=null;   // partial sums shown during animation
var anim=null; // {phase,start,count,cur:{i,o}}
function sizeNet(){
  var r=net.getBoundingClientRect(),w=r.width,h=r.height;if(!w||!h)return;dpr=Math.min(devicePixelRatio||1,2);
  var gap=18,g=Math.max(60,Math.min(h-24,(w-gap)*0.55,170));
  L={w:w,g:g,gap:gap,y0:18,xh:0,narrow:w<330};L.xo=g+gap;L.yo=18;L.ow=w-L.xo;L.oh=g;L.h=h;
  netCv.width=Math.round(w*dpr);netCv.height=Math.round(h*dpr);netCv.style.height=h+"px";nctx.setTransform(dpr,0,0,dpr,0,0);drawNet();
}
function hC(o){var c=L.g/8;return {x:L.xh+(o%8+.5)*c,y:L.y0+(Math.floor(o/8)+.5)*c}}
function oC(o){var r=L.oh/10;return {x:L.xo+14,y:L.yo+(o+.5)*r}}
function drawNet(){
  if(!L.w||!col.fg)return;var c=nctx,i,o,p;
  c.clearRect(0,0,L.w,L.h);
  c.font="10.5px 'IBM Plex Mono', ui-monospace, monospace";c.fillStyle=col.muted;c.textAlign="left";
  if(anim&&anim.phase==="requant"){c.fillStyle=col.warm;c.fillText(L.narrow?"ReLU → uint8":"ReLU · rescale → uint8",L.xh,12);c.fillStyle=col.muted}else c.fillText(L.narrow?"fc1 · 64 → uint8":"fc1 · 64 int32 → uint8",L.xh,12);c.fillText(L.ow>150?"fc2 · 10 logits":"fc2",L.xo,12);
  var ph=anim?anim.phase:"done";
  // wires for the current step
  if(anim&&X){
    c.lineWidth=1;
    if(ph==="fc2"){var b=hC(anim.cur.i);
      if(mode==="serial"){p=oC(anim.cur.o);c.strokeStyle=rgba(col.accent,.8);c.beginPath();c.moveTo(b.x,b.y);c.lineTo(p.x-10,p.y);c.stroke()}
      else{c.strokeStyle=rgba(col.accent,.25);for(o=0;o<10;o++){p=oC(o);c.beginPath();c.moveTo(b.x,b.y);c.lineTo(p.x-10,p.y);c.stroke()}}}
  }
  // hidden grid
  var hs=L.g/8,max1=1;if(R)for(o=0;o<64;o++)max1=Math.max(max1,R.a1[o]);
  var maxH=1;if(R)for(o=0;o<64;o++)maxH=Math.max(maxH,R.h[o]);
  for(o=0;o<64;o++){
    var x=L.xh+(o%8)*hs,y=L.y0+Math.floor(o/8)*hs,v=0;
    if(R){if(ph==="fc1")v=Math.max(0,P1[o])/max1;else v=R.h[o]/maxH}
    c.fillStyle=col.bg;c.fillRect(x+1,y+1,hs-2,hs-2);
    if(v>0){c.fillStyle=rgba(col.accent,Math.min(1,.12+v*.88));c.fillRect(x+1,y+1,hs-2,hs-2)}
    var hot=anim&&((ph==="fc1"&&mode==="serial"&&anim.cur.o===o)||(ph==="fc2"&&anim.cur.i===o));
    c.strokeStyle=hot?col.warm:col.line;c.lineWidth=hot?1.5:1;c.strokeRect(x+1.5,y+1.5,hs-3,hs-3);
  }
  // outputs
  var rh=L.oh/10,maxA=1;if(R)for(o=0;o<10;o++)maxA=Math.max(maxA,Math.abs(R.a2[o]));
  var bx=L.xo+16,bw=L.ow-16,mid=bx+bw*0.35;
  c.strokeStyle=col.line;c.beginPath();c.moveTo(mid+.5,L.yo);c.lineTo(mid+.5,L.yo+L.oh);c.stroke();
  for(o=0;o<10;o++){
    var yy=L.yo+o*rh,val=0;
    if(R){if(ph==="done")val=R.a2[o];else if(ph==="fc2")val=P2[o];}
    c.fillStyle=(R&&ph==="done"&&o===R.pred)?col.accent:col.muted;c.textAlign="left";c.fillText(String(o),L.xo,yy+rh*.5+4);
    if(val){var len=val/maxA*(val>0?bw*0.62:bw*0.35);c.fillStyle=val>0?col.accent:rgba(col.warm,.7);
      c.fillRect(val>0?mid:mid+len,yy+rh*.25,Math.abs(len),rh*.5)}
    if(anim&&ph==="fc2"&&mode==="serial"&&anim.cur.o===o){c.strokeStyle=col.warm;c.strokeRect(bx-2,yy+1,bw+2,rh-2)}
  }
}

/* ---------- animation ---------- */
var DUR={serial:{fc1:3600,requant:450,fc2:1100},parallel:{fc1:1500,requant:450,fc2:700}};
function setPx(on){showPx=on;pad.classList.toggle("px",on);drawPad()}
function setInput(x){X=x;R=x?infer(x):null;showPred(false);updateText();drawNet();setPx(!!x)}
function stopAnim(){anim=null;drawNet();drawPad()}
var notify=false;
function run(np){
  notify=!!np;if(!X)return;if(reduce){finish();return}
  P1.fill(0);P2.fill(0);anim={phase:"fc1",start:performance.now(),count:0,cur:{i:0,o:0}};showPred(false);
}
function finish(){anim=null;if(R){P1.set(R.a1);P2.set(R.a2)}showPred(true);updateText();drawNet();drawPad();if(notify&&R){notify=false;if(window.JM_robot)JM_robot.pickDigit(R.pred,R.pr[R.pred])}}
function step(now){
  if(anim&&X){
    var d=DUR[mode],el=now-anim.start,ph=anim.phase,tot,target,k;
    if(ph==="fc1"){
      tot=mode==="serial"?16384:256;target=Math.min(tot,Math.floor(el/d.fc1*tot));
      for(k=anim.count;k<target;k++){
        if(mode==="serial"){var o=k>>8,i=k&255;P1[o]+=W1[k]*X[i];anim.cur={o:o,i:i}}
        else{for(var oo=0;oo<64;oo++)P1[oo]+=W1[oo*256+k]*X[k];anim.cur={o:-1,i:k}}
      }
      anim.count=target;if(target>=tot)next("requant",now);
    }else if(ph==="requant"){if(el>=d.requant)next("fc2",now)}
    else if(ph==="fc2"){
      tot=mode==="serial"?640:64;target=Math.min(tot,Math.floor(el/d.fc2*tot));
      for(k=anim.count;k<target;k++){
        if(mode==="serial"){var o2=k>>6,i2=k&63;P2[o2]+=W2[k]*R.h[i2];anim.cur={o:o2,i:i2}}
        else{for(var q=0;q<10;q++)P2[q]+=W2[q*64+k]*R.h[k];anim.cur={o:-1,i:k}}
      }
      anim.count=target;if(target>=tot){finish()}
    }
    if(anim){updateText();drawNet();if(anim&&anim.phase==="fc1")drawPad()}
  }
  requestAnimationFrame(step);
}
function next(ph,now){anim.phase=ph;anim.start=now;anim.count=0;anim.cur={i:0,o:0}}
function fmt(n){return n.toLocaleString("en-US")}
function updateText(){
  var code=document.getElementById("code"),ct=document.getElementById("counters");
  if(!X){code.innerHTML='<span class="k">idle</span>  draw a digit or load a test image';ct.innerHTML="";return}
  var ph=anim?anim.phase:"done",macs=0,steps=0,s=mode==="serial";
  if(ph==="fc1"){macs=s?anim.count:anim.count*64;steps=anim.count}
  else if(ph==="requant"){macs=16384;steps=s?16384:256}
  else if(ph==="fc2"){macs=16384+(s?anim.count:anim.count*10);steps=(s?16384:256)+anim.count}
  else{macs=17024;steps=s?17024:320}
  var c=anim?anim.cur:{i:0,o:0},html;
  if(ph==="fc1")html=s?'<span class="k">fc1</span>  for o in 0..63: for i in 0..255: acc[o] += w1[o][i]·x[i]   <span class="v">o='+c.o+' i='+c.i+'</span>'
                      :'<span class="k">fc1</span>  64 lanes in parallel, lane o: acc[o] += w1[o][i]·x[i]   <span class="v">i='+c.i+' · 64 MACs this step</span>';
  else if(ph==="requant")html='<span class="k">requant</span>  h[o] = clamp(round(relu(acc[o]) · s_x·s_w1 / s_h), 0, 255)';
  else if(ph==="fc2")html=s?'<span class="k">fc2</span>  for o in 0..9: for i in 0..63: acc[o] += w2[o][i]·h[i]   <span class="v">o='+c.o+' i='+c.i+'</span>'
                      :'<span class="k">fc2</span>  10 lanes in parallel, lane o: acc[o] += w2[o][i]·h[i]   <span class="v">i='+c.i+' · 10 MACs this step</span>';
  else html='<span class="k">argmax</span>(logits) = <span class="v">'+R.pred+'</span>   logit = acc · s_w2·s_h';
  code.innerHTML=html;
  ct.innerHTML='<span>MACs <b>'+fmt(macs)+'</b></span><span>steps <b>'+fmt(steps)+'</b> / '+(s?"17,024":"320")+'</span><span><b>'+ph+'</b></span>';
}
function showPred(on){
  var dg=document.getElementById("digit"),cf=document.getElementById("conf"),t3=document.getElementById("top3");
  if(!on||!R){dg.textContent=X?"…":"·";dg.classList.add("wait");cf.innerHTML=X?"running":"&nbsp;";return}
  dg.textContent=R.pred;dg.classList.remove("wait");cf.textContent=Math.round(R.pr[R.pred]*100)+"% confidence";
  var idx=[0,1,2,3,4,5,6,7,8,9].sort(function(a,b){return R.pr[b]-R.pr[a]}).slice(0,3);
  if(t3)t3.innerHTML=idx.map(function(d){var p=R.pr[d];return '<div><span>'+d+'</span><i style="width:'+Math.max(2,p*100).toFixed(1)+'%"></i><span>'+(p<0.01?"<1":Math.round(p*100))+'%</span></div>'}).join("");
}
document.querySelectorAll(".seg button").forEach(function(b){b.addEventListener("click",function(){
  mode=b.dataset.m;document.querySelectorAll(".seg button").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});
  document.querySelectorAll("#steps>div").forEach(function(r){r.classList.toggle("on",r.dataset.m===mode)});run();
})});
document.querySelectorAll("#steps>div").forEach(function(r){r.classList.toggle("on",r.dataset.m===mode)});
document.getElementById("replay").addEventListener("click",run);
document.getElementById("skip").addEventListener("click",function(){if(anim)finish()});

/* ---------- hover inspector ---------- */
var tipCv=document.createElement("canvas");tipCv.width=tipCv.height=16;
function weightMap(o){
  var g=tipCv.getContext("2d"),im=g.createImageData(16,16),pos=hexRGB(col.accent),neg=hexRGB(col.warm),bg=hexRGB(col.bg);
  for(var i=0;i<256;i++){var w=W1[o*256+i]/127,c=w>=0?pos:neg,a=Math.min(1,Math.abs(w)*1.6);
    im.data[i*4]=bg[0]+(c[0]-bg[0])*a;im.data[i*4+1]=bg[1]+(c[1]-bg[1])*a;im.data[i*4+2]=bg[2]+(c[2]-bg[2])*a;im.data[i*4+3]=255}
  g.putImageData(im,0,0);
}
function hexRGB(h){h=h.replace("#","");var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
net.addEventListener("pointermove",function(e){
  var r=net.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,html=null,map=false;
  if(y>L.yo&&y<L.yo+L.oh&&x>L.xo&&x<L.xo+L.ow&&R){var dd=Math.floor((y-L.yo)/(L.oh/10));html="class "+dd+" · acc "+fmt(R.a2[dd])+" (int32)<br>logit "+R.lg[dd].toFixed(2)+" · p = "+(R.pr[dd]*100).toFixed(1)+"%"}
  else if(y>L.y0&&y<L.y0+L.g){
    if(x>L.xh&&x<L.xh+L.g){var o=Math.floor((y-L.y0)/(L.g/8))*8+Math.floor((x-L.xh)/(L.g/8));map=true;weightMap(o);
      html="neuron "+o+" · its 256 int8 weights"+(R?"<br>acc "+fmt(R.a1[o])+" (int32) → h = "+R.h[o]+" (uint8)":"")}
  }
  if(!html){tip.classList.remove("on");return}
  tip.innerHTML=(map?'<span class="m"></span>':"")+"<span>"+html+"</span>";
  if(map){var c=document.createElement("canvas");c.width=c.height=16;c.getContext("2d").drawImage(tipCv,0,0);tip.firstChild.replaceWith(c)}
  tip.style.left=Math.min(Math.max(x,120),r.width-120)+"px";tip.style.top=y+"px";tip.classList.add("on");
});
net.addEventListener("pointerleave",function(){tip.classList.remove("on")});

/* ---------- boot ---------- */
window.JM_edge={busy:function(){return !!anim},loadSample:function(d,a){var co=document.getElementById("cmdOut");if(co)co.textContent="";loadSample(d,a)}};
window.JM_markDigits=function(){};  /* the arm still reports its block digits; there is no sample row to mark any more */
if(window.JM_robot&&JM_robot.mark)JM_robot.mark();
readColors();
function resizeAll(){sizePad();sizeNet()}
if(window.ResizeObserver){new ResizeObserver(sizeNet).observe(net);new ResizeObserver(sizePad).observe(pad)}else addEventListener("resize",resizeAll);
resizeAll();
loadSample(7,false);
if(!reduce)setTimeout(run,700);
requestAnimationFrame(step);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){drawNet()});
})();
