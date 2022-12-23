/* 接收信息 */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
        if (data['event'] === 'ready') {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            // const iframeUrl = tabs[0].url.replace('screen', 'admin/hook')
            // iframe.attr('src', iframeUrl)
            const tabId = await getCurrentTabId()
            chrome.tabs.sendMessage(
                tabId,
                {
                    form: 'bg',
                    type: 'tab',
                    data: tab
                },
                (res) => {
                    console.log('bg', res)
                }
            )
        }
        sendResponse({ response: 'from bg' })
        console.log('bg', data, sender)
    })
    console.log('webRequest', chrome, chrome.webRequest)

    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            console.log('details', details)
            const url = details.url

            // if (url === 'http://datav.aliyun.com/api/admin/screen/941964/hook?workspaceId=3224') {
            //     console.log(22)
            // }
        },
        { urls: ['<all_urls>'] }
    )
    chrome.webRequest.onCompleted.addListener(
        function (details) {
            console.log('onCompleted details', details)
        },
        { urls: ['<all_urls>'] }
    )

    chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
        if (info.status && info.status == 'complete' && info.active) {
            console.log('onUpdated', tabId, info, tab)
            // chrome.webRequest.onBeforeRequest.addListener(
            //     function (details) {
            //         console.log('details', details)
            //         return { cancel: false }
            //     },
            //     //监听页面请求,你也可以通过*来匹配。urls地址，types请求资源类型
            //     { urls: [info.url] },
            //     ['blocking']
            // )
            // chrome.webRequest.onCompleted.addListener(
            //     function (details) {
            //         console.log('onCompleted details', details)
            //     },
            //     { urls: [info.url] }
            // )
        }
    })
}

const onReady = () => {}

const updateHook = async (data) => {
    // navigator.clipboard.readText().then((clipText) => console.log('clipText', clipText))
    console.log('updateHook', data)
    let cookie = ''
    data.cookies.forEach((c, index) => {
        cookie += `${(c.name = c.value)}`
        if (index < data.cookies.length - 2) cookie += '; '
    })
    const res = await fetch('https://datav.aliyun.com/api/admin/v3/screen/941964/hook?workspaceId=3224', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            cookie,
            'xsrf-token': 'd6gjJeGw-xuRqYXOJ2lOYpbc-MOqMjmUQbZ0'
        },
        body: JSON.stringify({ hook: data.code })
    }).catch((err) => console.log(err))
    console.log('res', res.json())
}

receiveMessage()
