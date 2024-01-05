const dataVHelper={template:`
    <nav id="datav-helper">
        <div id="datav-helper-toggle">
            <span> DataV  Helper
            <i class="datav-toggle-icon" role="button">></i>
            </span>
        </div>
        <div id="datav-helper-views">
            <div class="header">
                <div class="title">DataV Helper</div>
            </div>
            <div class="content">
                <div class="iframe" id="hookWrapper">
                    <iframe src="" frameborder="0" id="hook"></iframe>
                </div>
            </div>
            <div class="tip">Use <span>ctrl</span> + <span>s</span> to save code</div>
            <div class="footer">
                <button id="refreshHook">Reload Hook</button>
                <button id="refresh">Reload Page</button>
                <br />
                <button id="openHookPage">Open Hook Page</button>
                <button id="openEditPage">Open Edit Page</button>
            </div>
        </div>
    </nav>
`,hookUrl:window.location.href.replace("screen","admin/hook"),hookEl:null},receiveMessage=()=>{chrome.runtime.onMessage.addListener((e,o,t)=>{"request"===e.type&&200===e.status&&reload(),t({status:"ok"})})},reload=()=>{dataVHelper.hookEl.remove(),window.location.reload()},toggleHandler=()=>{const e=document.querySelector("#datav-helper");e.onmouseenter=()=>{e.classList.add("active")},e.onmouseleave=()=>{e.classList.remove("active")}},buttonClickHandler=()=>{document.querySelector("#openHookPage").onclick=()=>window.open(dataVHelper.hookUrl),document.querySelector("#refresh").onclick=()=>{reload()},document.querySelector("#refreshHook").onclick=()=>{dataVHelper.hookEl.remove(),setTimeout(()=>{var e=document.createElement("iframe");e.id="hook",e.setAttribute("src",dataVHelper.hookUrl),document.getElementById("hookWrapper").appendChild(e),dataVHelper.hookEl=e},0)},document.querySelector("#openEditPage").onclick=()=>window.open(dataVHelper.hookUrl.replace("hook","screen"))},eventRegister=()=>{window.addEventListener("beforeunload",()=>(dataVHelper.hookEl.remove(),null)),toggleHandler(),buttonClickHandler()},getBodyScale=()=>{let e=1,o=1,t="";try{var a,r;(t=document.body.style.transform)&&(a=t.replace("scale(","").replace(")",""),o=-1!==a.indexOf(",")?(r=a.split(", "),e=r[0],r[1]):e=a)}catch(e){console.log("error",e)}return{enable:Boolean(t),scaleW:e,scaleH:o}},setScale=(e=null)=>{var{scaleW:o=1,scaleH:t=1,enable:a=!1}=getBodyScale();document.body.style.setProperty("--datav-helper-scale-w",1/o),document.body.style.setProperty("--datav-helper-scale-h",1/t),e&&e(a)},init=()=>{window.addEventListener("load",()=>{let o=setInterval(()=>{setScale(e=>{e&&(clearInterval(o),o=null)})},1e3)}),window.addEventListener("resize",()=>{setTimeout(()=>{setScale()},300)});var e=document.createElement("div");e.innerHTML=dataVHelper.template,document.body.appendChild(e),dataVHelper.hookEl=document.querySelector("#hook"),dataVHelper.hookEl.setAttribute("src",dataVHelper.hookUrl),receiveMessage(),eventRegister()};init();