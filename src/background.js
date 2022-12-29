/* receive message */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener(async (_, __, sendResponse) => {
        sendResponse({ status: 'ok' })
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
        { urls: ['<all_urls>'] }
    )
}

requestHandler()
receiveMessage()
