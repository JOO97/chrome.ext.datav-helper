/* data */
const defaultOrigins = [
    {
        url: '*://datav.aliyun.com/screen/*',
        readonly: true,
        disabled: false
    },
    {
        url: '*://xyksh.nebulabd.cn/screen/*',
        readonly: true,
        disabled: false
    }
]
let origins = []

const tabHeaders = {}

/* receive message */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener((res, __, sendResponse) => {
        if (res['type'] === 'addUrl') setOrigin({ url: res.url, disabled: false })
        else if (res['type'] === 'delUrl') setOrigin({ url: res.url }, true)
        sendResponse({ status: 'ok' })
    })
}

const setOrigin = async (info, isDel = false) => {
    if (!isDel) origins.push(info)
    else {
        let idx = null
        origins.find((o, index) => {
            const r = o['url'] === info['url']
            if (r) idx = index
            return r
        })
        if (idx !== null) {
            origins.splice(idx, 1)
        }
    }
    await chrome.storage.sync.set({
        origins
    })
}

const getScreenInfo = (requestInfo) => {
    return fetch(requestInfo.url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            Cookie: requestInfo.headers['Cookie'],
            'xsrf-token': requestInfo.headers['xsrf-token']
        }
    }).then((res) => res.json())
}

const setTitle = (title) => {
    console.log('setTitle')
    document.title = `[💻]${title}`
}

/* Request interception */
const requestHandler = () => {
    //获取request headers
    // chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((e) => {
    // const msg = `Navigation blocked to ${e.request.url} on tab ${e.request.tabId}.`
    // console.log(msg, e)
    // fetch('http://112.111.45.169:7001/api/admin/screen/aaa/screen_info?workspaceId=1&screenId=aaa', {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json; charset=UTF-8',
    //         Cookie: 'jpgka9Dv2ng=eyJzZWNyZXQiOiJYOHhKY3MySjR1N1hfRS1oeVZaNW85V1ciLCJjYXAiOnsiZXhwaXJlVGltZSI6MTcxNjk1NDU4ODQ5MywiY29kZSI6IkRBM28ifSwidXNlcm5hbWUiOiJhZG1pbiIsIl9leHBpcmUiOjE3MTcxMTk5MzMzOTQsIl9tYXhBZ2UiOjg2NDAwMDAwfQ==; jpgka9Dv2ng.sig=UzGlGV_kVqVk1Q-yA0I9UxQLTAI',
    //         'xsrf-token': '8NnqZvyb-c9H_FEtnHhiyUQGnAKnc4SQBszE'
    //     }
    // }).then((res) => {
    //     console.log('=============', res.json())
    // })
    // })

    /**
     * 接口请求拦截
     */
    chrome.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            /* 匹配获取hook接口, 获取到请求头后请求screenInfo接口, 更新title */
            if (details.method === 'GET' && details.url.match(/\w+\/api\/admin(?:\/v3)?\/screen\/\w+\/hook(?:\?.*)?/)) {
                console.log('matched', details, details.requestHeaders)
                chrome.tabs.get(details.tabId, async (tab) => {
                    if (!tab) return
                    let [url, workspaceId] = details.url.split('?')
                    url = url.replace('/v3', '')
                    const screenId = url.split('screen/')[1].replace('/hook', '')
                    currentTabUrl = url
                    try {
                        const res = await getScreenInfo({
                            screenId,
                            url: `${url.replace('hook', 'screen_info')}?${workspaceId}&screenId=${screenId}`,
                            headers: details.requestHeaders
                        })
                        tabHeaders[url] = res.data
                        chrome.scripting
                            .executeScript({
                                target: { tabId: tab.id, frameIds: [details.frameId] },
                                func: setTitle,
                                args: [tabHeaders[url].name]
                            })
                            .then(() => console.log('injected a function'))
                    } catch (error) {
                        tabHeaders[url] = null
                    }
                })
            }
            return { requestHeaders: details.requestHeaders }
        },
        { urls: ['https://*/*', 'http://*/*'] },
        ['requestHeaders', 'extraHeaders']
    )
    chrome.webRequest.onCompleted.addListener(
        (details) => {
            const { frameType, type, method, statusCode } = details
            if (frameType === 'sub_frame' && type === 'xmlhttprequest') {
                switch (method) {
                    case 'POST':
                        /* 提交hook的接口 */
                        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                            chrome.tabs.sendMessage(tab.id, {
                                type: 'request',
                                name: 'updateHook',
                                status: statusCode
                            })
                        })
                        break
                    case 'GET':
                        /* 控制台的project接口 */
                        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                            chrome.tabs.sendMessage(tab.id, {
                                type: 'request',
                                name: 'getProject',
                                status: statusCode
                            })
                        })
                        break
                    default:
                        break
                }
            }
        },
        {
            urls: ['*://*/api/admin/screen/*', '*://*/api/admin/project?*']
        }
    )
}

/**
 * Inject script
 */
const injectScript = () => {
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (changeInfo.status == 'loading' && tab.status == 'loading' && tab.url != undefined) {
            const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id })
            if (frames.length === 1 && frames[0].frameType === 'outermost_frame') {
                origins.forEach(({ url, readonly }) => {
                    if (readonly || tab.url.indexOf(url) === -1) return
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id, frameIds: [frames[0].frameId] },
                        files: ['content.js']
                    })
                    chrome.scripting.insertCSS({
                        target: { tabId: tab.id, frameIds: [frames[0].frameId] },
                        files: ['content.css']
                    })
                })
            }
        }
    })
}

/* init */
const init = async () => {
    chrome.storage.onChanged.addListener((changes) => {
        let sendOrigins = []
        if (changes['origins'] && changes['origins']['newValue']) {
            origins = changes['origins']['newValue']
            sendOrigins = origins
        }
        chrome.runtime.sendMessage({
            type: 'storageChange',
            origins: sendOrigins
        })
    })
    // chrome.storage.sync.clear()
    let storage = await chrome.storage.sync.get('origins')

    if (!storage['origins'] || !storage['origins'].length) {
        await chrome.storage.sync.set({
            origins: defaultOrigins
        })
    } else origins = storage['origins']

    requestHandler()
    receiveMessage()
    injectScript()
}

init()
