/* 发送信息 */
const sendMessage = (message) => {
    chrome.runtime.sendMessage(message, (data) => {
        // alert(data)
    })
}

/* 接收信息 */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
        window.console.log('main receiveMessage', data, sender, sendResponse)
        sendResponse('123')
    })
    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            console.log(details)
            // 回调返回一个对象，如果对象里得cancel为true则会拦截不继续请求
            return { cancel: true }
        },
        //监听页面请求,你也可以通过*来匹配。urls地址，types请求资源类型
        { urls: ['<all_urls>'] },
        ['blocking']
    )
}

$('#upload').on('click', () => {
    sendMessage({
        event: 'click'
    })
})

// $('textarea').on('paste', (e) => {
//     setTimeout(() => {
//         chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
//             chrome.cookies.getAll(
//                 {
//                     url: tabs[0].url
//                 },
//                 (cookies) => {
//                     sendMessage({
//                         event: 'paste',
//                         content: {
//                             code: $('textarea').val(),
//                             cookies
//                         }
//                     })
//                 }
//             )
//         })
//     }, 0)
// })

const iframeHandler = () => {
    const iframe = $('#iframe')
    chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
        console.log('tabs', tabs)
        const iframeUrl = tabs[0].url.replace('screen', 'admin/hook')
        iframe.attr('src', iframeUrl)
    })
}

const saveKeyHandler = () => {
    const iframeWindow = $('#iframe')[0].contentWindow['window']
    console.log('iframeWindow', iframeWindow, iframeWindow.document)
    $(iframeWindow.document).keydown(function (e) {
        if (e.ctrlKey == true && e.keyCode == 83) {
            console.log('ctrl+s')
            return false // 截取返回false就不会保存网页了
        }
    })
}

;(function (xhr) {
    console.log(0)
    const XHR = xhr.prototype
    const open = XHR.open
    const send = XHR.send

    XHR.open = function (method, url) {
        this._methods = method
        this._url = url
        return open.apply(this, arguments)
    }

    XHR.send = function (postData) {
        console.log('request', this._url, postData)
        this.addEventListener('load', function () {})
        return send.apply(this, arguments)
    }
})(XMLHttpRequest)

iframeHandler()
saveKeyHandler()
receiveMessage()
