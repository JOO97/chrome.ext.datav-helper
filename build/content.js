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
                <div class="iframe">
                    <iframe src="" frameborder="0" id="hook"></iframe>
                </div>
            </div>
            <div class="tip">Use <span>ctrl</span> + <span>s</span> to save code</div>
            <div class="footer">
                <button id="refresh">刷新</button>
                <button id="openHookPage">打开hook页</button>
                <button id="openEditPage">打开编辑页</button>
            </div>
        </div>
    </nav>
`,hookUrl:window.location.href.replace("screen","admin/hook"),hookEl:null},receiveMessage=()=>{chrome.runtime.onMessage.addListener((e,o,t)=>{"request"===e.type&&200===e.status&&reload(),t({status:"ok"})})},reload=()=>{dataVHelper.hookEl.remove(),window.location.reload()},toggleHandler=()=>{const e=document.querySelector("#datav-helper");e.onmouseenter=()=>{e.classList.add("active")},e.onmouseleave=()=>{e.classList.remove("active")}},buttonClickHandler=()=>{document.querySelector("#openHookPage").onclick=()=>window.open(dataVHelper.hookUrl),document.querySelector("#refresh").onclick=()=>{reload()},document.querySelector("#openEditPage").onclick=()=>window.open(dataVHelper.hookUrl.replace("hook","screen"))},eventRegister=()=>{window.addEventListener("beforeunload",()=>(dataVHelper.hookEl.remove(),null)),toggleHandler(),buttonClickHandler()},init=()=>{window.addEventListener("load",()=>{let o=1;document.body.style.transform.split(" ").forEach(e=>{-1!==e.indexOf("scale")&&(o=e.replace("scale(","").replace(")",""))}),document.body.style.setProperty("--datav-helper-scale",1/o)});var e=document.createElement("div");e.innerHTML=dataVHelper.template,document.body.appendChild(e),dataVHelper.hookEl=document.querySelector("#hook"),dataVHelper.hookEl.setAttribute("src",dataVHelper.hookUrl),receiveMessage(),eventRegister()};init();