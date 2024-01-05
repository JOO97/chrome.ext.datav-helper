let origins=[];const receiveMessage=()=>{chrome.runtime.onMessage.addListener((e,t,s)=>{"storageChange"===e.type&&(origins=e.origins,setListItem(origins)),s({status:"ok"})})},urlPattern=/^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/,eventRegister=()=>{const s=document.querySelector("#input");s.addEventListener("keydown",e=>{if(13===e.keyCode){const t=e.target["value"];t&&urlPattern.test(t)&&(origins.find(e=>e.url===t)||(chrome.runtime.sendMessage({type:"addUrl",url:t}),s.value=""))}})};let delFlag=!1;const setListItem=async()=>{let s="";origins.forEach((e,t)=>{s+=`
         <li class="list-item">
          <div class="list-item-content">
           <span>${e.url}</span>
           <span class="extra">
             ${e.readonly?"<i>Default</i>":'<span class="del">Del</span>'}
           </span>
          </div>
         </li>
        `}),document.querySelector("#datav-helper-popup .list").innerHTML=s,document.querySelectorAll(".del").forEach((e,t)=>{e.onclick=async e=>{await chrome.runtime.sendMessage({type:"delUrl",url:origins[t+1].url})}})},init=async()=>{receiveMessage();var e=await chrome.storage.sync.get("origins");origins=e.origins||[],setListItem(origins),eventRegister()};init();