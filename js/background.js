/* 接收信息 */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener(async (data, _, sendResponse) => {
        if (data['event'] === 'ready') {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            const tabId = await getCurrentTabId()
            chrome.tabs.sendMessage(tabId, {
                form: 'bg',
                type: 'tab',
                data: tab
            })
        }
        sendResponse({ response: 'from bg' })
    })

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
        { urls: ['<all_urls>'] }
    )
}

receiveMessage()
