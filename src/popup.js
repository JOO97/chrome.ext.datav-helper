let origins = []

/* receive message */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener((res, __, sendResponse) => {
        if (res['type'] === 'storageChange') {
            origins = res['origins']
            setListItem(origins)
        }
        sendResponse({ status: 'ok' })
    })
}

const urlPattern = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/
const eventRegister = () => {
    const input = document.querySelector('#input')
    input.addEventListener('keydown', (e) => {
        if (e.keyCode !== 13) return
        const { value } = e.target
        if (!value || !urlPattern.test(value)) return
        const find = origins.find((o) => o.url === value)
        if (find) return
        chrome.runtime.sendMessage({
            type: 'addUrl',
            url: value
        })
        input.value = ''
    })
}
let delFlag = false

const setListItem = async () => {
    let listItem = ''
    origins.forEach((item, index) => {
        listItem += `
         <li class="list-item">
          <div class="list-item-content">
           <span>${item.url}</span>
           <span class="extra">
             ${item.readonly ? '<i>Default</i>' : '<span class="del">Del</span>'}
           </span>
          </div>
         </li>
        `
    })
    const listEl = document.querySelector('#datav-helper-popup .list')
    listEl.innerHTML = listItem

    const delButtons = document.querySelectorAll('.del')
    delButtons.forEach((btn, index) => {
        btn.onclick = async (e) => {
            await chrome.runtime.sendMessage({
                type: 'delUrl',
                url: origins[index + 1]['url']
            })
        }
    })
}

const init = async () => {
    receiveMessage()
    const res = await chrome.storage.sync.get('origins')
    origins = res['origins'] || []
    setListItem(origins)
    eventRegister()
}

init()
