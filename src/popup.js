let origins = []

/* Receive message */
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

/**
 * Popup 事件注册
 */
const eventRegister = () => {
    try {
        const input = document.querySelector('#input')
        input.addEventListener('keydown', (e) => {
            if (e.keyCode !== 13) return
            const { value } = e.target
            if (!value || !urlPattern.test(value)) return alert('⚠️Please input the correct URL')
            const find = origins.find((o) => o.url === value)
            if (find) return alert('⚠️This URL already exists')
            chrome.runtime.sendMessage({
                type: 'addUrl',
                url: value
            })
            input.value = ''
        })
    } catch (error) {
        console.error(error)
    }
}

/* Set list item */
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
                url: origins[index + 2]['url']
            })
        }
    })
}

/* Init */
const init = async () => {
    /*  监听消息 */
    receiveMessage()

    /* 从读取本地存储 */
    const res = await chrome.storage.sync.get('origins')
    origins = res['origins'] || []

    /* 初始化列表数据 */
    setListItem(origins)

    /* 事件注册 */
    eventRegister()
}

init()
