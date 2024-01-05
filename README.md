# Hook Helper Extension

> 在以往的大屏开发中需要频繁的在**hook 页面**和**预览页面**进行来回切换，为了简化这个流程而开发了这个插件。通过 Chrome 插件的能力将 hook 页面嵌入到预览页面中，在需要进行代码更新的时候，只需要将代码粘贴到嵌入的 hook 面板里，提交后可以自动刷新当前的预览页面，同时也可以避免出现将 a 大屏的 hook 代码提交到 b 大屏的问题。

## 功能说明

1. 支持在大屏预览页面中进行 hook 代码的更新
2. 支持配置部署版的地址

## 使用步骤

### 1 插件导入

1.1 打开`chrome://extensions/`

1.2 选择`加载已解压的扩展程序`，将插件文件导入

![image-20221230093231573](https://zhangjiamin-bucket.oss-cn-hangzhou.aliyuncs.com/self/datav-helper-extension/image-20221230093231573.png)

### 2 在非部署版大屏中使用

2.1 打开任意一个大屏的预览页(非部署版), 如 `https://datav.aliyun.com/screen/879865`

2.2 鼠标移入后可看到嵌入的 hook 页面，将代码粘贴到编辑面板中，使用`ctrl + s`进行保存，之后预览页面会自动进行刷新

![image-20221230092000042](https://zhangjiamin-bucket.oss-cn-hangzhou.aliyuncs.com/self/datav-helper-extension/image-20221230092000042.png)

![image-20221230092018790](https://zhangjiamin-bucket.oss-cn-hangzhou.aliyuncs.com/self/datav-helper-extension/image-20221230092018790.png)

### 3 在部署版大屏中使用

> 插件默认只会匹配到非部署版本大屏中，如果需要在部署版大屏中使用，可在插件的弹出面板中进行地址配置

3.1 点击插件的 logo，打开插件弹窗

![image-20221230093954840](https://zhangjiamin-bucket.oss-cn-hangzhou.aliyuncs.com/self/datav-helper-extension/image-20221230093954840.png)

3.2 输入配置地址(地址需要包含 screen 字符)，按下`enter`键进行添加， 点击`del`按钮进行删除(添加后需要刷新页面)

![image-20221230094030051](https://zhangjiamin-bucket.oss-cn-hangzhou.aliyuncs.com/self/datav-helper-extension/image-20221230094030051.png)

![image-20221230093114910](https://zhangjiamin-bucket.oss-cn-hangzhou.aliyuncs.com/self/datav-helper-extension/image-20221230094100754.png)

![image-20221230094237311](https://zhangjiamin-bucket.oss-cn-hangzhou.aliyuncs.com/self/datav-helper-extension/image-20221230094237311.png)

3.3 其余步骤`同2.1~2.2`
