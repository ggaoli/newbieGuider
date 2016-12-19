    var newbieOptions={
        name:'introduction',
        appendLayoutTo:'#fndiv-5',//针对difish的配置项 设置将弹出层插入的位置（不配置，默认为body）
        //autoHeightData:'fndiv',//针对difish的配置项 设置清除 当插件运行时清除每一数据块上的限制高度
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
                    position: 'bottom',
                    imgStep:"m/guide/images/step/logo.png"
                }
            },
            {
                wrapper: '#0102000000',
                popup: {
                    content: '#walkthrough-3',
                    type: 'tooltip',
                    position: 'bottom',
                    imgStep:"m/guide/images/step/work.png"
                }
            },
            {
                wrapper: '#fndiv-49',
                popup: {
                    content: '#walkthrough-4',
                    type: 'tooltip',
                    position: 'bottom',
                    imgStep:"m/guide/images/step/msg.png"
                }
            },
            {
                wrapper: '#p0103000000',
                popup: {
                    content: '#walkthrough-5',
                    type: 'tooltip',
                    position: 'bottom',
                    imgStep:"m/guide/images/step/msgTitle.png"
                }
            },
            {
                wrapper: '#pmc_footer',
                popup: {
                    content: '#walkthrough-6',
                    type: 'tooltip',
                    position:'right'
                }
            }
            ]
    };
    var Q = jQuery.noConflict();// 配置时，避免$符号冲突，如已定义，需删除该行
    //页面载入初始化显示新手引导框
    Q('body').newbieGuide(newbieOptions);
    // 新手引导按钮绑定
    Q('.btn-help').on('click',function(){
        Q('body').newbieGuide(newbieOptions);
        Q('body').newbieGuide('show');
    });