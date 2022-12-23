const template = `
    <nav class="datav-helper">
            <div class="datav-toggle" id="datav-toggler">
                <i class="octotree-toggle-icon" role="button">></i>
                <span>DataV Hook</span>
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
                        <iframe src="" frameborder="0" id="iframe"></iframe>
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

const sendMessage = (message) => {
    chrome.runtime.sendMessage(message, (data) => {
        // alert(data)
    })
}

/* 接收信息 */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
        console.log('content receiveMessage', data, sender)
    })
}

const eventRegister = () => {
    const iframeWindow = $('#iframe')[0].contentWindow['window']
    console.log('iframeWindow', iframeWindow)
    console.log('iframeWindow', iframeWindow.document)
    const doc = $(iframeWindow.document)[0]
    console.log('doc', doc)
    const script = document.createElement('script')
    script.text = `var confirm=function(){
        console.log(0);
        return false
    };window.confirm = confirm;`
    const body = doc.getElementsByTagName('body')
    body[0].appendChild(script)
    ;(function () {
        if (typeof iframeWindow.CustomEvent === 'function') return false

        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined }
            var evt = iframeWindow.document.createEvent('CustomEvent')
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
            return evt
        }
        CustomEvent.prototype = iframeWindow.Event.prototype
        iframeWindow.CustomEvent = CustomEvent
    })()
    ;(function () {
        function ajaxEventTrigger(event) {
            var ajaxEvent = new CustomEvent(event, { detail: this })
            iframeWindow.dispatchEvent(ajaxEvent)
        }

        var oldXHR = iframeWindow.XMLHttpRequest

        function newXHR() {
            var realXHR = new oldXHR()

            realXHR.addEventListener(
                'abort',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxAbort')
                },
                false
            )
            realXHR.addEventListener(
                'error',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxError')
                },
                false
            )
            realXHR.addEventListener(
                'load',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxLoad')
                },
                false
            )
            realXHR.addEventListener(
                'loadstart',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxLoadStart')
                },
                false
            )
            realXHR.addEventListener(
                'progress',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxProgress')
                },
                false
            )
            realXHR.addEventListener(
                'timeout',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxTimeout')
                },
                false
            )
            realXHR.addEventListener(
                'loadend',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxLoadEnd')
                },
                false
            )
            realXHR.addEventListener(
                'readystatechange',
                function () {
                    ajaxEventTrigger.call(this, 'ajaxReadyStateChange')
                },
                false
            )

            let send = realXHR.send
            realXHR.send = function (...arg) {
                send.apply(realXHR, arg)
                realXHR.body = arg[0]
                ajaxEventTrigger.call(realXHR, 'ajaxSend')
            }

            let open = realXHR.open
            realXHR.open = function (...arg) {
                open.apply(realXHR, arg)
                realXHR.method = arg[0]
                realXHR.orignUrl = arg[1]
                realXHR.async = arg[2]
                ajaxEventTrigger.call(realXHR, 'ajaxOpen')
            }

            let setRequestHeader = realXHR.setRequestHeader
            realXHR.requestHeader = {}
            realXHR.setRequestHeader = function (name, value) {
                realXHR.requestHeader[name] = value
                setRequestHeader.call(realXHR, name, value)
            }
            return realXHR
        }
        iframeWindow.XMLHttpRequest = newXHR
    })()
    var Gpins_data = {}
    // 监听页面的ajax
    iframeWindow.addEventListener('ajaxReadyStateChange', function (e) {
        let xhr = e.detail
        if (xhr.readyState == 4 && xhr.status == 200) {
            // xhr.getAllResponseHeaders()  响应头信息
            // xhr.requestHeader            请求头信息
            // xhr.responseURL              请求的地址
            // xhr.responseText             响应内容
            // xhr.orignUrl                 请求的原始参数地址
            // xhr.body                     post参数，（get参数在url上面）

            console.log(xhr)
        }
    })

    $(iframeWindow.document).ajaxComplete((e) => {
        console.log('iframeWindow ajaxComplete', e)
    })

    $('.datav-react-monaco-editor textarea').keydown(function (e) {
        console.log(e)
        if (e.ctrlKey == true && e.keyCode == 83) {
            console.log('ctrl+s')
            return false // 截取返回false就不会保存网页了
        }
    })

    $('#openHookPage').click(() => {
        console.log('click')
        $.get('http://127.0.0.1:5500/cookie.json', (res) => {
            console.log('res', res)
        })
    })
    $('#refresh').click(() => {
        window.location.reload()
    })

    $(document).ajaxComplete((e) => {
        console.log('ajaxComplete', e)
    })
}

// document.body.style.backgroundColor = 'orange'
$(document).ready(() => {
    receiveMessage()
    $('body').append(template)
    const iframeUrl = window.location.href.replace('screen', 'admin/hook').replace('https', 'http')
    $('#iframe').attr('src', iframeUrl)
    eventRegister()
})
