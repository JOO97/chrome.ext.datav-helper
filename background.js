/* 接收信息 */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
        if (data['event'] === 'paste') {
            updateHook(data.content)
        }
        console.log('bg', data, sender)
    })
}

receiveMessage()

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
