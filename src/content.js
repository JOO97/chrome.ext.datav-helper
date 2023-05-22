const dataVHelper = {
	template: `
    <nav id="datav-helper">
        <div id="datav-helper-toggle">
            <span> DataV  Helper
            <i class="datav-toggle-icon" role="button">></i>
            </span>
        </div>
        <div id="datav-helper-views">
            <div class="header">
                <div class="title">DataV Helper</div>
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
                <button id="openHookPage">Open Hook Page</button>
                <button id="openEditPage">Open Edit Page</button>
            </div>
        </div>
    </nav>
`,
	hookUrl: window.location.href.replace('screen', 'admin/hook'), //hook url
	hookEl: null,
};

/* receive message */
const receiveMessage = () => {
	chrome.runtime.onMessage.addListener((res, sender, sendResponse) => {
		if (res['type'] === 'request') {
			// 更新hook成功 刷新页面
			if (res['status'] === 200) {
				reload();
			}
		}
		sendResponse({ status: 'ok' });
	});
};

/* reload */
const reload = () => {
	dataVHelper.hookEl.remove(); //更新后移除iframe, 不会显示hook页面的提示弹窗
	window.location.reload();
};

/* toggle handler */
const toggleHandler = () => {
	const wrapper = document.querySelector('#datav-helper');
	wrapper.onmouseenter = () => {
		wrapper.classList.add('active');
	};
	wrapper.onmouseleave = () => {
		wrapper.classList.remove('active');
	};
};

/* button handlers*/
const buttonClickHandler = () => {
	document.querySelector('#openHookPage').onclick = () => window.open(dataVHelper.hookUrl);
	document.querySelector('#refresh').onclick = () => {
		reload();
	};
	// 更新hook代码
	document.querySelector('#refreshHook').onclick = () => {
		dataVHelper.hookEl.remove();
		setTimeout(() => {
			const el = document.createElement('iframe');
			el.id = 'hook';
			el.setAttribute('src', dataVHelper.hookUrl);
			const wrapper = document.getElementById('hookWrapper');
			wrapper.appendChild(el);
			dataVHelper.hookEl = el;
		}, 0);
	};
	document.querySelector('#openEditPage').onclick = () =>
		window.open(dataVHelper.hookUrl.replace('hook', 'screen'));
};

/**
 * event register
 */
const eventRegister = () => {
	window.addEventListener('beforeunload', () => {
		dataVHelper.hookEl.remove();
		return null;
	});
	toggleHandler();
	buttonClickHandler();
};

/**
 *  获取当前页面body标签的缩放值
 * @returns
 */
const getBodyScale = () => {
	let scaleW = 1,
		scaleH = 1,
		bodyTransform = '';
	try {
		bodyTransform = document.body.style.transform;
		if (bodyTransform) {
			const transform = bodyTransform.replace('scale(', '').replace(')', '');
			if (transform.indexOf(',') !== -1) {
				const scale = transform.split(', ');
				scaleW = scale[0];
				scaleH = scale[1];
			} else {
				scaleW = transform;
				scaleH = transform;
			}
		}
	} catch (error) {}
	return {
		enable: Boolean(bodyTransform),
		scaleW,
		scaleH,
	};
};

/**
 * 设置scale
 * @param {*} cb
 */
const setScale = (cb = null) => {
	let { scaleW = 1, scaleH = 1, enable = false } = getBodyScale();
	document.body.style.setProperty('--datav-helper-scale-w', 1 / scaleW);
	document.body.style.setProperty('--datav-helper-scale-h', 1 / scaleH);
	cb && cb(enable);
};

/* init */
const init = () => {
	window.addEventListener('load', () => {
		let getScaleTimer = setInterval(() => {
			setScale((enable) => {
				if (enable) {
					clearInterval(getScaleTimer);
					getScaleTimer = null;
				}
			});
		}, 1000);
	});

	window.addEventListener('resize', () => setScale());

	//创建面板元素
	const datavHelperPanel = document.createElement('div');
	datavHelperPanel.innerHTML = dataVHelper.template;
	document.body.appendChild(datavHelperPanel);

	dataVHelper.hookEl = document.querySelector('#hook');
	dataVHelper.hookEl.setAttribute('src', dataVHelper.hookUrl);

	receiveMessage();
	eventRegister();
};

init();
