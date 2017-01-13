# newbieGuider
新手引导组件
###兼容性
谷歌火狐主流浏览器，IE6+
###依赖文件
jquery.js 1.7+以上版本
###配置项

```
var newbieOptions={
        name:'introduction',
        steps: [
            {
                popup: { //定义弹出提示引导层
                    content: '#walkthrough-1',
                    type: 'modal',
                    width:340
                }
            },
            {
                wrapper: '.logo',
                //当前引导对应的元素位置
                popup: {
                    content: '#walkthrough-2',
                    //关联的内容元素
                    type: 'tooltip',
                    //弹出方式（tooltip和modal）
                    position: 'right',
                    imgStep:".step1"
                }
            },
            {
                wrapper: '.title',
                popup: {
                    content: '#walkthrough-3',
                    type: 'tooltip',
                    position: 'bottom',
                    imgStep:".step2"
                }
            },
            {
                wrapper: '.slide-p',
                popup: {
                    content: '#walkthrough-4',
                    type: 'tooltip',
                    position: 'bottom',
                    callBack:function () {//点击下一步的回调事件
                        alert("点击下一步的回调事件测试");
                    },
                    customWidth:'500px',//自定义高亮层的宽度
                    customHeight:'110px'//自定义高亮层的高度
                }
            },
            {
                wrapper: '.slide-p2',
                popup: {
                    content: '#walkthrough-5',
                    type: 'tooltip',
                    position: 'bottom'
                }
            },
              }
            }
            {
                wrapper: '.slide-p',
                popup: {
                    content: '#walkthrough-8',
                    type: 'tooltip',
                    position: 'bottom'
                }
            }]
    };

    //页面载入初始化显示新手引导框
    $('body').newbieGuide(newbieOptions);
    // 新手引导按钮绑定
    $('.btn-help').on('click',function(){
        $('body').newbieGuide(newbieOptions);
        $('body').newbieGuide('show');
    });
```

###自定义的配置项，欢迎补充
```

$.fn.newbieGuide.defaults = {
        steps: [{
            wrapper: "",
            popup: {
                content: "",
                type: "modal",
                position: "top",
                offsetHorizontal: 0,
                offsetVertical: 0,
                offsetArrowHorizontal: 0,
                offsetArrowVertical: 0,
                width: "290",
                contentRotation: 0,
                imgStep:'',
                callBack:null,//点击下一步回调事件
                customWidth:'',//自定义遮盖层的宽度
                customHeight:''//自定义遮盖层的高度
            },
            autoScroll: true,
            scrollSpeed: 500,
            lockScrolling: false,
            onEnter: null,
            onLeave: null
        }],
        name: null,
        onLoad: true,
        onBeforeShow: null,
        onAfterShow: null,
        onRestart: null,
        onClose: null,
        onCookieLoad: null,
        appendLayoutTo:'body',//默认弹出层append节点
        buttons: {
            jpwNext: {
                i18n: "继续 →",
                show: function() {
                    return !isNextStep()
                }
            },
            jpwStart: {
                i18n: "了解新功能",
                show: function() {
                    return !isStartStep()
                }
            },
            jpwPrevious: {
                i18n: "← 上一步",
                show: function() {
                    return !isFirstStep()
                }
            },
            jpwFinish: {
                i18n: "结束 ✔",
                show: function() {
                    return isLastStep()
                }
            }
        }
    }

```
