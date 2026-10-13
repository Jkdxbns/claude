/* theme: follows prefers-color-scheme; the toggle overrides it, is saved in localStorage and fires "jm-theme" */
(function(){
  var root=document.documentElement,mq=matchMedia("(prefers-color-scheme: dark)");
  try{var s=localStorage.getItem("jm-theme");if(s)root.setAttribute("data-theme",s)}catch(e){}
  function isDark(){return root.getAttribute("data-theme")?root.getAttribute("data-theme")==="dark":mq.matches}
  var btn=document.getElementById("themeBtn");if(!btn)return;
  function label(){var d=isDark();btn.setAttribute("aria-label",d?"Switch to light theme":"Switch to dark theme");btn.title=btn.getAttribute("aria-label")}
  label();mq.addEventListener("change",label);
  btn.addEventListener("click",function(){
    var n=isDark()?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem("jm-theme",n)}catch(e){}
    label();window.dispatchEvent(new Event("jm-theme"));
  });
})();
