const useCookies = ['']

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
