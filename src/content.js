const template = `
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
`

const hookUrl = window.location.href.replace('screen', 'admin/hook') //hook url
let hookEl = null

/* receive message */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
        if (res['type'] === 'request') {
            // 更新hook成功 刷新页面
            if (res['status'] === 200) {
                reload()
            }
        }
        sendResponse({ status: 'ok' })
    })
}

/* reload */
const reload = () => {
    hookEl.remove() //更新后移除iframe, 不会显示hook页面的提示弹窗
    window.location.reload()
}

/* toggle handler */
const toggleHandler = () => {
    const wrapper = document.querySelector('#datav-helper')
    wrapper.onmouseenter = () => {
        wrapper.classList.add('active')
    }
    wrapper.onmouseleave = () => {
        wrapper.classList.remove('active')
    }
}

/* button handlers*/
const buttonClickHandler = () => {
    document.querySelector('#openHookPage').onclick = () => window.open(hookUrl)
    document.querySelector('#refresh').onclick = reload
    document.querySelector('#openEditPage').onclick = () => window.open(hookUrl.replace('hook', 'screen'))
}

/* event register */
const eventRegister = () => {
    window.addEventListener('beforeunload', () => {
        hookEl.remove()
        return null
    })
    toggleHandler()
    buttonClickHandler()
}

/* init */
const init = () => {
    const datavHelperPanel = document.createElement('div')
    datavHelperPanel.innerHTML = template
    document.body.appendChild(datavHelperPanel)

    hookEl = document.querySelector('#hook')
    hookEl.setAttribute('src', hookUrl)

    receiveMessage()
    eventRegister()
}
init()
