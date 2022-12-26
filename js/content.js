const template = `
    <nav class="datav-helper" id="datav-helper">
            <div class="datav-toggle" id="datav-helper-toggler">
                <span>DataV Helper<i class="datav-toggle-icon" role="button">></i></span>
            </div>
            <div class="datav-views">
                <div class="header">
                    <div class="title">DataV Helper</div>
                </div>
                <div class="content">
                    <div class="project">
                        <div id="ti"></div>
                    </div>
                    <div class="iframe">
                        <iframe src="" frameborder="0" id="hook"></iframe>
                    </div>
                </div>
                <div class="extra">Use <span>ctrl</span> + <span>s</span> to save code</div>
                <div class="footer">
                    <button id="refresh">刷新</button>
                    <button id="openHookPage">打开hook页</button>
                    <button id="openEditPage">打开编辑页</button>
                </div>
            </div>
        </nav>
`

let hookUrl = ''

const sendMessage = (message) => {
    chrome.runtime.sendMessage(message, (data) => {})
}

/* 接收信息 */
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
    $('#hook').remove() //更新后直接把iframe移除, 为了显示hook页面自带的提示弹窗
    window.location.reload()
}

const toggleHandler = () => {
    const toggle = $('#datav-helper')
    toggle.hover(
        () => {
            const wrapper = $('#datav-helper')
            wrapper.addClass('active')
        },
        () => {
            const wrapper = $('#datav-helper')
            wrapper.removeClass('active')
        }
    )
}

const buttonClickHandler = () => {
    $('#openHookPage').click(() => window.open(hookUrl))

    $('#refresh').click(reload)

    $('#openEditPage').click(() => window.open(hookUrl.replace('hook', 'screen')))
}

const eventRegister = () => {
    window.addEventListener('beforeunload', () => {
        $('#hook').remove()
        return null
    })
    toggleHandler()
    buttonClickHandler()
}

$(document).ready(() => {
    $('body').append(template)
    hookUrl = window.location.href.replace('screen', 'admin/hook')
    $('#hook').attr('src', hookUrl)
    receiveMessage()
    eventRegister()
})
