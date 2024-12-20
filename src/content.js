/**
 * Content script
 * @description: 注入到页面的脚本
 */

const cache = {
    hook: null
}

const dataVHelper = {
    template: `
    <nav id="datav-helper">
        <div id="datav-helper-toggle">
            <span>
            <span>Hook </span>
            <span>Helper</span>
            <i class="datav-toggle-icon" role="button">></i>
            </span>
        </div>
        <div id="datav-helper-views">
            <div class="header">
                <div class="title">Hook Helper</div>
            </div>
            <div class="content">
                <div class="iframe" id="hookWrapper">
                    <iframe src="" frameborder="0" id="hook"></iframe>
                </div>
            </div>
            <div class="tip">Use <span>ctrl</span> + <span>s</span> to save code</div>
            <div class="footer">
                <button id="refreshHook">Reload Hook</button>
                <button id="refresh">Reload Page</button>
                <br />
                <button id="openHookPage">Open Hook Page</button>
                <button id="openEditPage">Open Edit Page</button>
            </div>
        </div>
        <div id="datav-helper-tool">
          <span class="pin iconfont icon-pushpin"></span>
        </div>
    </nav>
`,
    hookUrl: window.location.href.replace('screen', 'admin/hook'), //hook url
    hookEl: null
}

/* 面板是否为固定状态 */
let panelFixed = false

/* receive message */
const receiveMessage = () => {
    chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
        // console.log('receiveMessage', res)
        if (res['type'] === 'request' && res['status'] === 200) {
            switch (res['name']) {
                // 更新hook成功 刷新页面
                case 'updateHook':
                    reload()
                    break
                //控制台的项目列表有更新
                case 'getProject':
                    break
                /* 获取hook NOTE: 进入打包页面后background.js中会自动请求获取hook的接口，并把结果发送给content.js */
                case 'getHook':
                    cache.hook = res.data
                    break
                default:
                    break
            }
        } else {
            console.log('22222receiveMessage', res)
        }
        sendResponse({ status: 'ok' })
    })
}

/* reload */
const reload = () => {
    dataVHelper.hookEl.remove() //更新后移除iframe, 不会显示hook页面的提示弹窗
    window.location.reload()
}

/* toggle handler */
const toggleHandler = () => {
    const wrapper = document.querySelector('#datav-helper')

    wrapper.onmouseenter = () => {
        wrapper.classList.add('active')
    }
    wrapper.onmouseleave = () => {
        if (panelFixed) return
        wrapper.classList.remove('active')
    }
}

/* button handlers*/
const buttonClickHandler = () => {
    document.querySelector('#openHookPage').onclick = () => window.open(dataVHelper.hookUrl)
    document.querySelector('#refresh').onclick = () => {
        reload()
    }
    // 更新hook代码
    document.querySelector('#refreshHook').onclick = () => {
        dataVHelper.hookEl.remove()
        setTimeout(() => {
            const el = document.createElement('iframe')
            el.id = 'hook'
            el.setAttribute('src', dataVHelper.hookUrl)
            const wrapper = document.getElementById('hookWrapper')
            wrapper.appendChild(el)
            dataVHelper.hookEl = el
        }, 0)
    }
    document.querySelector('#openEditPage').onclick = () => window.open(dataVHelper.hookUrl.replace('hook', 'screen'))
}

/* pin icon handler */
const pinIconClickHandler = () => {
    const pinEl = document.querySelector('#datav-helper-tool .pin')
    if (!pinEl) return
    pinEl.addEventListener('click', () => {
        panelFixed = !panelFixed
        pinEl.classList[panelFixed ? 'add' : 'remove']('active')
    })
}

/**
 * event register
 */
const eventRegister = () => {
    window.addEventListener('beforeunload', () => {
        dataVHelper.hookEl.remove()
        return null
    })
    toggleHandler()
    buttonClickHandler()
    pinIconClickHandler()
}

/**
 *  获取当前页面body标签的缩放值
 * @returns
 */
const getBodyScale = () => {
    let scaleW = 1,
        scaleH = 1,
        bodyTransform = ''
    try {
        bodyTransform = document.body.style.transform
        if (bodyTransform) {
            const transform = bodyTransform.replace('scale(', '').replace(')', '')
            if (transform.indexOf(',') !== -1) {
                const scale = transform.split(', ')
                scaleW = scale[0]
                scaleH = scale[1]
            } else {
                scaleW = transform
                scaleH = transform
            }
        }
    } catch (error) {
        console.log('error', error)
    }

    return {
        enable: Boolean(bodyTransform),
        scaleW,
        scaleH
    }
}

/**
 * 设置scale
 * @param {*} cb
 */
const setScale = (cb = null) => {
    let { scaleW = 1, scaleH = 1, enable = false } = getBodyScale()
    scaleW = 1
    scaleH = 1
    document.body.style.setProperty('--datav-helper-scale-w', 1 / scaleW)
    document.body.style.setProperty('--datav-helper-scale-h', 1 / scaleH)
    cb && cb(enable)
}

/**
 * 节流
 * @param {*} func
 * @param {*} delay
 * @returns
 */
function throttle(func, delay) {
    let timerId

    return function (...args) {
        if (!timerId) {
            timerId = setTimeout(() => {
                func.apply(this, args)
                timerId = null
            }, delay)
        }
    }
}

/**
 * 项目列表更新
 */
const projectListChangedHandler = () => {
    const mainScreenEl = document.querySelector('.main-screen')
    if (!mainScreenEl) return
    const listItems = mainScreenEl.children
    Array.from(listItems).forEach((item) => {
        const previewEl = item.querySelector('a.preview')
        const screenId = previewEl.href.split('/screen/')[1]
        // console.log('itemEl', itemEl)
        // item.addEventListener('click', (e) => {
        //     e.stopPropagation()
        //     console.log('click')
        // })
        const mainNameEl = item.querySelector('.main-name')

        if (!item.querySelector('.checkbox')) {
            const checkbox = document.createElement('input')
            checkbox.classList.add('checkbox')
            checkbox.type = 'checkbox'
            checkbox.id = `screen-${screenId}`
            checkbox.name = `screen-${screenId}`
            checkbox.href = `${location.origin}/api/admin/v4/pack/${screenId}`
            mainNameEl.appendChild(checkbox)
        }

        if (!item.querySelector('.hook.preview')) {
            /* Hook */
            const hookEl = document.createElement('a')
            hookEl.innerHTML = previewEl.innerHTML
            hookEl.style.right = '60px'
            hookEl.classList = 'preview hook'
            hookEl.target = '_blank'
            hookEl.href = previewEl.href.replace('screen', 'admin/hook')
            hookEl.title = 'Hook'
            const icon = hookEl.querySelector('i')
            icon.classList.replace('icon-preview', 'icon-debug')
            previewEl.parentElement.appendChild(hookEl)

            /* 下載 */
            if (previewEl.href.includes('nebulabd') || previewEl.href.includes('datav')) {
                const idEl = document.createElement('span')
                idEl.innerHTML = previewEl.href.split('screen/')[1].replace('m/', '')
                idEl.style.left = '20px'
                idEl.style.fontSize = '20px'
                idEl.style.width = 'fit-content'
                idEl.style.fontWeight = 600
                idEl.classList = 'preview hook'
                previewEl.parentElement.appendChild(idEl)

                const downloadEl = document.createElement('a')
                downloadEl.innerHTML = previewEl.innerHTML
                downloadEl.style.right = '83px'
                downloadEl.classList = 'preview hook'
                downloadEl.target = '_blank'
                let downloadHref = previewEl.href.replace('screen', 'api/admin/v4/pack')
                downloadEl.href = downloadHref
                downloadEl.title = 'Package'
                const downloadIcon = downloadEl.querySelector('i')
                downloadIcon.classList.replace('icon-preview', 'icon-local-deploy')
                previewEl.parentElement.appendChild(downloadEl)
            }
        }
    })

    /* 批量打包按钮 */
    if (!document.querySelector('.package-multiple')) {
        const packageAllBtn = document.createElement('a')
        packageAllBtn.classList = 'goto-workspace package-multiple'
        packageAllBtn.innerText = 'Package'
        packageAllBtn.href = 'javascript: void(0)'
        packageAllBtn.addEventListener('click', () => {
            const currentSelected = Array.from(document.querySelectorAll('input.checkbox')).filter((el) => el.checked)
            console.log('currentSelected', currentSelected)

            currentSelected.forEach((el) => {
                window.open(el.href, '_blank')
            })
        })
        document.querySelector('.project-title').appendChild(packageAllBtn)
    }
}

const projectListChangedHandlerThrottle = throttle(projectListChangedHandler, 300)

/**
 * 控制台页面
 * @description 列表项插入打开hook页面的按钮
 */
const setupDashboard = () => {
    /* 样式覆盖 */
    const style = document.createElement('style')
    style.type = 'text/css'
    style.innerText = `
      .screen .screen-main .main-name {flex-flow: wrap !important;height:auto!important;}
      .screen .screen-main .screen-name-input {flex: unset; width: 100%;}
      .screen .screen-name-input .input {width:100% !important;}
      .screen .screen-info .screen-edit {opacity: 1;background: rgba(0,0,0,0.26);}
      .screen .screen-info .screen-img {opacity: 1;}
    `
    document.head.appendChild(style)

    /* 监听列表父节点 */
    const targetElement = document.querySelector('.datav-content')
    /* 创建一个 MutationObserver 实例 */
    const observer = new MutationObserver((mutationsList, observer) => {
        /* 处理变化 */
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') projectListChangedHandlerThrottle()
        }
    })

    // 配置观察选项
    const config = { attributes: true, childList: true, subtree: true }
    // 开始观察目标元素
    observer.observe(targetElement, config)

    /* 默认执行一次 */
    projectListChangedHandlerThrottle()
}

/**
 * Set up edit page
 */
const setupEditPage = () => {
    /* 右上角添加跳转到hook页面的按钮 */
    const container = document.querySelector('.global-actions')
    const siblingButton = Array.from(container.children)[Array.from(container.children).length - 1]
    const hookButton = document.createElement('a')
    hookButton.innerHTML = siblingButton.innerHTML
    hookButton.classList = 'hook header-button ml4'
    hookButton.href = location.href.replace('screen', 'hook')
    hookButton.title = 'HOOK'
    hookButton.target = '_blank'
    const icon = hookButton.querySelector('i')
    icon.classList.replace('icon-local-deploy', 'icon-debug')
    container.appendChild(hookButton)
}

/**
 * Set up hook page
 */
const setupHookPage = () => {
    const href = location.href
    const parentElement = document.querySelector('.hook-text')

    const toPreviewBtn = document.createElement('a')
    toPreviewBtn.innerText = 'Preview'
    toPreviewBtn.classList = 'datav-btn-md datav-btn-outline datav-btn field-btn'
    toPreviewBtn.href = href.replace('/admin/hook', '/screen')
    toPreviewBtn.target = '_blank'

    const toEditBtn = document.createElement('a')
    toEditBtn.innerText = 'Edit'
    toEditBtn.classList = 'datav-btn-md datav-btn-outline datav-btn field-btn'
    toEditBtn.href = href.replace('hook', 'screen')
    toEditBtn.target = '_blank'

    parentElement.appendChild(toEditBtn)
    parentElement.appendChild(toPreviewBtn)
}

/**
 * Set up pack page
 */
const setupPackPage = () => {
    /* 监听列表父节点 */
    const targetElement = document.querySelector('.pack-button')
    /* 打包中 */
    if (Array.from(targetElement.classList).includes('disable')) {
        /* 创建一个 MutationObserver 实例 */
        const observer = new MutationObserver((mutationsList, observer) => {
            /* 处理变化 */
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                    /* 打包完成 */
                    const dBtn = createFullDownloadBtn(mutation.target.href)
                    targetElement.parentElement.appendChild(dBtn)
                    dBtn.click()
                }
            }
        })
        observer.observe(targetElement, { attributes: true })
    } else {
        /* 打包完成 */
        const dBtn = createFullDownloadBtn(targetElement.href)
        targetElement.parentElement.appendChild(dBtn)
        dBtn.click()
    }
}

/**
 * 从url中读取对应的文件内容
 * @param {*} fileUrl
 * @returns
 */
const readFileFromUrl = (fileUrl) => {
    return fetch(fileUrl)
        .then((response) => response.arrayBuffer())
        .catch((error) => {
            throw error
        })
}

/**
 * 创建 Full Download 按钮
 * @param {*} href
 * @returns
 * @description 在原本的打包下载功能上将hook代码也进行打包, 并做一些额外处理, 如环境参数替换等
 */
const createFullDownloadBtn = (href) => {
    const el = document.createElement('a')
    el.classList = 'pack-button'
    el.href = 'javascript: void(0)'
    el.style.marginLeft = '10px'
    el.style.width = 'auto'
    el.style.padding = '0 10px'

    el.innerText = 'Full Download'

    const zipFileName = href.split('/zip/')[1]

    el.addEventListener('click', async () => {
        console.log('start full download')
        const p = document.querySelector('.pack-watcher').children[1]
        p.innerText = 'Downloading...'
        const paceElements = document.querySelectorAll('.pace')
        Array.from(paceElements).forEach((el) => {
            el.classList.remove('stop')
            el.classList.add('pace-active')
        })

        const arrayBuffer = await readFileFromUrl(href)
        const zip = new JSZip()
        await zip.loadAsync(arrayBuffer)

        /* 读取data.json文件 */
        const dataJsonFileName = Object.keys(zip.files).find((n) => n.includes('data.json'))
        if (!dataJsonFileName) return

        // const data = await zip.file(dataJsonFileName).async('string')
        // downloadAssetsFromData(JSON.parse(data).source)

        /* 添加hook.js文件 */
        const hookContent = getHook()
        zip.file(`${zipFileName.replace('.zip', '')}/hook.js`, hookContent)
        zip.generateAsync({ type: 'blob' }).then((content) => {
            // see FileSaver.js
            saveAs(content, zipFileName)

            Array.from(paceElements).forEach((el) => {
                el.classList.remove('pace-active')
                el.classList.add('stop')
            })
            p.innerText = '页面打包完成, 请下载'
        })
    })
    return el
}

/**
 * 获取hook代码
 */
const getHook = () => {
    let { hook = '' } = cache
    if (!hook)
        return `/**
 * @param {Stage} stage
 */
module.exports = (stage) => { }
`
    /* hook处理 */
    const result = hook.replace(`ENV: 'dev'`, `ENV: 'prod'`)
    return result
}

/* init */
const init = () => {
    console.log('content.js init')
    window.addEventListener('load', () => {
        /* 判断当前是在哪个类型的页面 */
        const { href } = window.location

        /* 控制台 */
        if (href.match(/\/\d{1,}\/project(?:\?.*)?/)) setTimeout(setupDashboard, 1000)

        /* 编辑页 */
        if (href.match(/\/admin\/screen\/\w+/)) setTimeout(setupEditPage, 1000)

        /* 预览页 */
        if (href.match(/^(?!.*\/admin\/).*\/screen\/\w+/)) {
            let getScaleTimer = setInterval(() => {
                setScale((enable) => {
                    if (enable) {
                        clearInterval(getScaleTimer)
                        getScaleTimer = null
                    }
                })
            }, 1000)
            window.addEventListener('resize', () => {
                // 延迟设置
                setTimeout(setScale, 300)
            })

            //创建面板元素
            const datavHelperPanel = document.createElement('div')
            datavHelperPanel.innerHTML = dataVHelper.template
            document.querySelector('html').appendChild(datavHelperPanel)

            dataVHelper.hookEl = document.querySelector('#hook')
            dataVHelper.hookEl.setAttribute('src', dataVHelper.hookUrl)
            eventRegister()
        }

        /* Hook页 */
        if (href.match(/\/admin\/hook\/\w+/)) setTimeout(setupHookPage, 1000)

        /* 打包页 */
        if (href.match(/\/admin\/packWatcher\/\d{1,}\/[\w-]+/)) setTimeout(setupPackPage, 1000)

        receiveMessage()
    })
}

init()
