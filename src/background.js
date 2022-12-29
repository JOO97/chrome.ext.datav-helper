/* data */
const defaultOrigins = [
    {
        url: '*://datav.aliyun.com/screen/*',
        readonly: true,
        disabled: false
    }
]
let origins = []

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

/* webRequest */
const requestHandler = () => {
    chrome.webRequest.onCompleted.addListener(
        (details) => {
            const { frameType, type, method, statusCode } = details
            if (frameType === 'sub_frame' && type === 'xmlhttprequest' && method === 'POST') {
                chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'request',
                        status: statusCode
                    })
                })
            }
        },
        { urls: ['*://*/api/admin/screen/*'] }
    )
}

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
