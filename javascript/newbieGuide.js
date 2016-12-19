/**
 * Created by Adminstrater on 2016/6/30.
 */
;(function($, window, document, undefined) {
    //"use strict";
    var _globalWalkthrough = {},
        _elements = [],
        _activeWalkthrough, _activeId, _hasDefault = true,
        _counter = 0,
        _isCookieLoad, _firstTimeLoad = true,
        _onLoad = true,
        _index = 0,
        _isWalkthroughActive = false,
        $jpwOverlay = $('<div id="jpwOverlay" class="png"></div>'),
        $jpWalkthrough = $('<div id="jpWalkthrough"></div>'),
        $jpwTooltip = $('<div id="jpwTooltip" class="png"></div>'),
        fnItemHeight={},
        fnItemOverFlow={};
    var methods = {
        isActive: function() {
            return !!_isWalkthroughActive
        },
        index: function(value) {
            if (typeof value !== "undefined") {
                _index = value
            }
            return _index
        },
        init: function(options) {
            options = $.extend(true, {}, $.fn.newbieGuide.defaults, options);
            var that = this;
            if (!options.name) {
                throw new Error("Must provide a unique name for a tour")
            }
            this.first().data("jpw", options);
            options._element = this;
            return this.each(function(i) {
                options = options || {};
                options.elementID = options.name;
                _globalWalkthrough[options.name] = options;
                _elements.push(options.name);

                if (options.onLoad) {
                    _counter++
                }
                if (_counter === 1 && _onLoad) {
                    _activeId = options.name;
                    _activeWalkthrough = _globalWalkthrough[_activeId];
                    _onLoad = false
                }
                if (i + 1 === that.length && _counter === 0) {
                    _activeId = options.name;
                    _activeWalkthrough = _globalWalkthrough[_elements[0]];
                    _hasDefault = false
                }
            })
        },
        renderOverlay: function() {
            if (_counter > 1) {
                debug("Warning: Only 1st walkthrough will be shown onLoad as default")
            }
            if (typeof _isCookieLoad === "undefined") {
                _isWalkthroughActive = true;
                if (!onEnter()) return;
                showStep();
                setTimeout(function() {
                    if (isFirstStep() && _firstTimeLoad) {
                        if (!onAfterShow()){}
                    }
                }, 100)
            } else {
                onCookieLoad(_globalWalkthrough)
            }
        },
        restart: function(e) {
            if (isFirstStep()) return;
            _index = 0;
            if (!onRestart(e)) return;
            if (!onEnter(e)) return;
            showStep()
        },
        close: function() {
            var options = _activeWalkthrough;
            onLeave();
            if (typeof options.onClose === "function") {
                options.onClose.call(this)
            }
            _index = 0;
            _firstTimeLoad = true;
            _isWalkthroughActive = false;
            setCookie("_walkthrough-" + _activeId, 0, 365);
            _isCookieLoad = getCookie("_walkthrough-" + _activeId);
            $jpwOverlay.fadeOut("slow", function() {
                $(this).remove()
            });
            $jpWalkthrough.fadeOut("slow", function() {
                $(this).html("").remove()
            });
            $("#jpwClose").fadeOut("slow", function() {
                $(this).remove()
            });

            if(options.appendLayoutTo!='body'){
                $('body').attr('scroll','no').css('overflow','auto');
                var hasL=options.appendLayoutTo;
                var hasLArrName=hasL.substring(1,(hasL.indexOf('-')));
                //var hasLArrNum=hasL.substring(hasL.indexOf('-')+1,hasL.length);
                var fnDiv=$('[id*="'+hasLArrName+'"]');
                for (var i= 0,len=fnDiv.length;i<len;i++){
                    $(fnDiv[i]).css({
                        //'height':fnItemHeight[i],
                        'height':'auto',
                        'overflow':fnItemOverFlow[i]
                    });
                }
            }else{
                $('body').css('overflow','auto');
            }
        },
        show: function(name, e) {
            e = name == null ? name : e;
            name = name || this.first().data("jpw").name;
            _activeWalkthrough = _globalWalkthrough[this.first().data("jpw").name];
            if (name === _activeId && _isWalkthroughActive || !onEnter(e)) return;
            _isWalkthroughActive = true;
            _firstTimeLoad = true;
            if (!onBeforeShow()) return;
            showStep();
            if (isFirstStep() && _firstTimeLoad) {
                if (!onAfterShow()){}
            }
        },
        next: function(e) {
            _firstTimeLoad = false;
            // if (isLastStep()) return;
            // if (!onLeave(e)) return;
            _index = parseInt(_index, 10) + 1;
            if (!onEnter(e)) {
                methods.next()
            }
            showStep("next");

            var options = _activeWalkthrough,
                step = options.steps[_index-1];
            if(step.popup.callBack){
                step.popup.callBack();
            }
        },
        finish: function() {
            _index = parseInt(_index, 10);
            var options = _activeWalkthrough,
                step = options.steps[_index];
            if(step.popup.callBack){
                step.popup.callBack();
            }
        },
        prev: function(e) {
            if (isFirstStep()) return;
            if (!onLeave(e)) return;
            _index = parseInt(_index, 10) - 1;
            if (!onEnter(e)) {
                methods.prev()
            }
            showStep("prev")
        },
        getOptions: function(activeWalkthrough) {
            var _wtObj;
            if (activeWalkthrough) {
                _wtObj = {};
                _wtObj = _activeWalkthrough
            } else {
                _wtObj = [];
                for (var wt in _globalWalkthrough) {
                    _wtObj.push(_globalWalkthrough[wt])
                }
            }
            return _wtObj
        },
        refresh: function() {
            showStep("next");
            showStep("prev")
        }
    };

    function showStep(skipDirection) {
        var options = _activeWalkthrough,
            step = options.steps[_index],
            targetElement = options._element.find(step.wrapper),
            scrollTarget = getScrollParent(targetElement),
            maxScroll, scrollTo;
        if (step.popup.type !== "modal" && !targetElement.length) {
            if (step.popup.fallback === "skip" || typeof step.popup.fallback === "undefined") {
                methods[skipDirection]();
                return
            }
            step.popup.type = step.popup.fallback
        }
        maxScroll = scrollTarget[0].scrollHeight - scrollTarget.outerHeight();
        switch (step.popup.position) {
            case "top":
                scrollTo = step.popup.type === "modal" ? 0 : Math.floor(targetElement.offset().top-410);
                break;
            case "bottom":
                var tipH=$('.hole-content').height()+410;
                if(tipH>$(window).height()){
                    scrollTo = step.popup.type === "modal" ? 0 : Math.floor(targetElement.offset().top);
                }else{
                    scrollTo = step.popup.type === "modal" ? 0 : Math.floor(targetElement.offset().top- ($(window).height()-tipH)/2);
                }
                break;
            case "left":
            case "right":
                scrollTo = step.popup.type === "modal" ? 0 : Math.floor(targetElement.offset().top - $(window).height() / 3);
                break
        }
        if (scrollTarget.scrollTop() !== scrollTo && (scrollTarget.scrollTop() === maxScroll && scrollTo < maxScroll || scrollTo <= 0 && scrollTarget.scrollTop() > 0 || scrollTo > 0))
        {
            $jpWalkthrough.addClass("jpw-scrolling");
            $jpwTooltip.fadeOut("fast");
            scrollTarget.animate({
                scrollTop: scrollTo
            }, options.steps[_index].scrollSpeed, buildWalkthrough);
        } else {
            buildWalkthrough()
        }
    }
    function buildWalkthrough() {
        $jpWalkthrough.removeClass("jpw-scrolling");
        var options = _activeWalkthrough,
            step = options.steps[_index],
            targetElement, scrollParent, maxHeight;
        options.steps[_index] = $.extend(true, {}, $.fn.newbieGuide.defaults.steps[0], step);
        targetElement = options._element.find(step.wrapper);
        scrollParent = getScrollParent(targetElement);
        $jpwOverlay.show();
        if (step.popup.type !== "modal" && step.popup.type !== "nohighlight") {
            $jpWalkthrough.html("");
            if (step.wrapper === "" || typeof step.wrapper === "undefined") {
                debug('Your walkthrough position is: "' + step.popup.type + '" but wrapper is empty or undefined. Please check your "' + _activeId + '" wrapper parameter.');
                return
            }
            maxHeight = scrollParent.outerHeight() - targetElement.offset().top + scrollParent.offset().top + scrollParent.scrollTop();
            maxHeight = maxHeight <= 0 ? targetElement.outerHeight() : maxHeight;
            $jpwOverlay.appendTo($jpWalkthrough);

            $("<div>").append($("<div class='hole-content'>").css({
                position: "absolute",
                top:0,
                bottom: 0,
                left: 0,
                right: 0
            }).append($(getImgSource(step)).css({
                'position':'absolute',
                'top':'10px',
                'left':'10px'})
            )).addClass("overlay-hole").appendTo($jpWalkthrough);

            
            function overlayHoleStyle() {
                $(".overlay-hole").height(function(){
                    if(step.popup.imgStep){
                        return $('.hole-content img').height();
                    }else if(step.popup.customHeight){
                        return step.popup.customHeight;
                    }
                    else{
                        return targetElement.outerHeight()
                    }
                }).width(function(){
                    if(step.popup.imgStep){
                        return $('.hole-content img').width()
                    }else if(step.popup.customWidth){
                        return step.popup.customWidth;
                    }
                    else{
                        return targetElement.outerWidth()
                    }
                }).css({
                    padding: "10px",
                    position: "absolute",
                    top: targetElement.offset().top - 9,
                    left: targetElement.offset().left - 10,
                    "z-index": 999999
                });
            }
            overlayHoleStyle();
            $(window).resize(function(){
                overlayHoleStyle();
            });

            if ($("#jpWalkthrough").length==1) {
                $("#jpWalkthrough").remove()
            }
            $jpWalkthrough.appendTo($(options.appendLayoutTo)).show();
            $jpwTooltip.show();
            showTooltip();
            $(window).resize(function(){
                showTooltip();
            });
        }
        else if (step.popup.type === "modal") {
            if ($("#jpWalkthrough").length) {
                $("#jpWalkthrough").remove()
            }
            showModal()
        } else {
            if ($("#jpWalkthrough").length) {
                $("#jpWalkthrough").remove()
            }
        }
        showButton("jpwPrevious",'#tooltipBtn');
        showButton("jpwNext",'#tooltipBtn');
        showButton("jpwStart",'#tooltipBottom');
        showButton("jpwFinish",'#tooltipBtn');
        $(window).resize(function(){
            showButton("jpwPrevious",'#tooltipBtn');
            showButton("jpwNext",'#tooltipBtn');
            showButton("jpwStart",'#tooltipBottom');
            showButton("jpwFinish",'#tooltipBtn');
        });
    }
    function showModal() {
        var options = _activeWalkthrough,
            step = options.steps[_index];
        if(options.appendLayoutTo!='body'){
            $('body').attr('scroll','yes');
            var hasL=options.appendLayoutTo;
            var hasLArrName=hasL.substring(1,(hasL.indexOf('-')));
            //var hasLArrNum=hasL.substring(hasL.indexOf('-')+1,hasL.length);
            var fnDiv=$('[id*="'+hasLArrName+'"]');
            for (var i= 0,len=fnDiv.length;i<len;i++){
                fnItemHeight[i]=$($(fnDiv[i])).css('height');
                fnItemOverFlow[i]=$($(fnDiv[i])).css('overflow');
                $(fnDiv[i]).css({
                    'height':'auto',
                    'overflow':'inherit'
                })
            }
        }
        $jpwOverlay.appendTo($(options.appendLayoutTo)).show().removeClass("transparent");
        var textRotation = setRotation(parseInt(step.popup.contentRotation, 10));
        $jpwTooltip.css({
            position: "fixed",
            left: "50%",
            top: $(window).height()/2,
            "margin-left": -(parseInt(step.popup.width, 10) + 60) / 2 + "px",
            "margin-top": -(parseInt(step.popup.width, 10) + 60) / 2 + "px",
            "z-index": "999999"
        }).addClass('ie6-jpwTooltip');

        $(window).resize(function(){
            $jpwTooltip.css('top', $(window).height()/2);
        });

        var tooltipSlide = $('<div id="tooltipTop">'  + '<div id="topLeft"></div>' + '<div id="topRight"></div>' + "</div>" + '<div id="tooltipInner">' + "</div>" + '<div id="tooltipBottom" class="clearfix">' + '<a id="jpwClose"><i class="png"></i></a>' + "</div>");
        $jpWalkthrough.html("");
        $jpwTooltip.html("").append(tooltipSlide).wrapInner($("<div />", {
            id: "tooltipWrapper",
            style: "width:" + cleanValue(parseInt(step.popup.width, 10) + 30)
        })).appendTo($jpWalkthrough);
        $jpWalkthrough.appendTo($(options.appendLayoutTo));
        $jpwTooltip.show();
        $("#tooltipWrapper").css(textRotation);
        $("#tooltipInner").append(getContent(step)).show();
        $jpWalkthrough.show();
        $('body').css('overflow','hidden');
    }
    function showTooltip() {
        var opt = _activeWalkthrough,
            step = opt.steps[_index];
        var top, left, arrowTop, arrowLeft,
            overlayHoleWidth = $("#jpWalkthrough .overlay-hole").outerWidth(),
            overlayHoleHeight = $("#jpWalkthrough .overlay-hole").outerHeight(),
            overlayHoleTop = $("#jpWalkthrough .overlay-hole").offset().top,
            overlayHoleLeft = $("#jpWalkthrough .overlay-hole").offset().left,
            arrow = 30;
        var textRotation = typeof step.popup.contentRotation === "undefined" || parseInt(step.popup.contentRotation, 10) === 0 ? clearRotation() : setRotation(parseInt(step.popup.contentRotation, 10));
        if ($("#jpwOverlay").length) {
            $("#jpwOverlay").addClass("transparent")
        }
        var tooltipSlide = $('<div id="tooltipTop">'+ '<div id="topLeft"></div>' + '<div id="topRight"></div>' + "</div>" + '<div id="tooltipInner">' + "</div>" + '<div id="tooltipBottom" class="clearfix">' + '<a id="jpwClose"><i class="png"></i></a>'  + "</div>"+ '<div id="toolTipNum" >'+"</div>"+ '<div id="tooltipBtn" class="clearfix">'+"</div>");
        $jpwTooltip.html("").css({
            "margin-left": "0",
            "margin-top": "0",
            position: "absolute",
            "z-index": "999999"
        }).append(tooltipSlide).wrapInner($("<div />", {
            id: "tooltipWrapper",
            style: "width:" + cleanValue(parseInt(step.popup.width, 10) + 30)
        })).appendTo($jpWalkthrough);
        $jpWalkthrough.appendTo($(opt.appendLayoutTo)).show();
        $("#tooltipWrapper").css(textRotation);
        $("#tooltipInner").append(getContent(step)).show();
        $jpwTooltip.append('<span class="' + step.popup.position + ' png"> </span>');
        var indexNum='<span class="indexNum">'+_index+'</span>';
        var numFull='<span class="numTotle">'+(opt.steps.length-1)+'</span>';
        $("#toolTipNum").html(indexNum+'/'+numFull);
        switch (step.popup.position) {
            case "top":
                top = overlayHoleTop - ($jpwTooltip.height() + arrow / 2) + parseInt(step.popup.offsetVertical, 10) - 120;
                left = overlayHoleLeft + overlayHoleWidth / 2 - $jpwTooltip.width() / 2 - 5 + parseInt(step.popup.offsetHorizontal, 10);
                arrowLeft = $jpwTooltip.width() / 2 - arrow + parseInt(step.popup.offsetArrowHorizontal, 10);
                arrowTop = step.popup.offsetArrowVertical ? parseInt(step.popup.offsetArrowVertical, 10) : "";
                break;
            case "right":
                top = overlayHoleTop - arrow / 2 + parseInt(step.popup.offsetVertical, 10);
                top = overlayHoleTop - arrow / 2 + parseInt(step.popup.offsetVertical, 10);
                left = overlayHoleLeft + overlayHoleWidth + arrow / 2 + parseInt(step.popup.offsetHorizontal, 10) + 55;
                arrowTop = arrow + parseInt(step.popup.offsetArrowVertical, 10);
                arrowLeft = step.popup.offsetArrowHorizontal ? parseInt(step.popup.offsetArrowHorizontal, 10) : "";
                break;
            case "bottom":
                top = overlayHoleTop + overlayHoleHeight + parseInt(step.popup.offsetVertical, 10) + 57;
                left =overlayHoleLeft + overlayHoleWidth / 2 - $jpwTooltip.width() / 2 - 5 + parseInt(step.popup.offsetHorizontal, 10);
                arrowLeft = $jpwTooltip.width() / 2 - arrow + parseInt(step.popup.offsetArrowHorizontal, 10);
                arrowTop = step.popup.offsetArrowVertical ? parseInt(step.popup.offsetArrowVertical, 10) : "";
                break;
            case "left":
                top = overlayHoleTop - arrow / 2 + parseInt(step.popup.offsetVertical, 10);
                left = overlayHoleLeft - $jpwTooltip.width() - arrow + parseInt(step.popup.offsetHorizontal, 10) - 70;
                arrowTop = arrow + parseInt(step.popup.offsetArrowVertical, 10);
                arrowLeft = step.popup.offsetArrowVertical ? parseInt(step.popup.offsetArrowHorizontal, 10) : "";
                break
        }
        $("#jpwTooltip span." + step.popup.position).css({
            top: cleanValue(arrowTop),
            left: cleanValue(arrowLeft)
        });
        $jpwTooltip.css({
            top: cleanValue(top),
            left: cleanValue(left)
        });
        $jpWalkthrough.show();
        $('body').css('overflow','inherit');
    }
    function getContent(step) {
        var option = step.popup.content,
            content;
        try {
            content = $("body").find(option).html()
        } catch (e) {}
        return content || option
    }
    function getImgSource(step) {
        var option = step.popup.imgStep,
            contentHtml;
        if(option){
            contentHtml =$("body").find(option).prop('outerHTML');
        }else{
            contentHtml=''
        }
        return contentHtml || option
    }

    function showButton(id, appendTo) {
        if ($("#" + id).length) return;
        var btn = _activeWalkthrough.buttons[id];
        appendTo = appendTo || "#tooltipWrapper";
        if (!btn) return;
        if (typeof btn.show === "function" && !btn.show() || !btn.show) {
            return
        }
        $(appendTo).append($("<a />", {
            id: id,
            html: btn.i18n
        }))
    }
    function onCookieLoad(options) {
        for (var i = 0; i < _elements.length; i++) {
            if (typeof options[_elements[i]].onCookieLoad === "function") {
                options[_elements[i]].onCookieLoad.call(this)
            }
        }
        return false
    }
    function onLeave(e) {
        var options = _activeWalkthrough;
        if (typeof options.steps[_index].onLeave === "function") {
            if (!options.steps[_index].onLeave.call(this, e, _index)) {
                return false
            }
        }
        return true
    }
    function onEnter(e) {
        var options = _activeWalkthrough;
        if (typeof options.steps[_index].onEnter === "function") {
            return options.steps[_index].onEnter.call(this, e, _index)
        }
        return true
    }
    function onRestart(e) {
        var options = _activeWalkthrough;
        _isWalkthroughActive = true;
        methods.restart(e);
        if (typeof options.onRestart === "function") {
            if (!options.onRestart.call(this)) {
                return false
            }
        }
        return true
    }
    function onBeforeShow() {
        var options = _activeWalkthrough || {};
        _index = 0;
        if (typeof options.onBeforeShow === "function") {
            if (!options.onBeforeShow.call(this)) {
                return false
            }
        }
        return true
    }
    function onAfterShow() {
        var options = _activeWalkthrough;
        _index = 0;
        if (typeof options.onAfterShow === "function") {
            if (!options.onAfterShow.call(this)) {
                return false
            }
        }
        return true
    }
    function debug(message) {
        if (window.console && window.console.log) window.console.log(message)
    }
    function clearRotation() {
        var rotationStyle = {
            "-webkit-transform": "none",
            "-moz-transform": "none",
            "-o-transform": "none",
            filter: "none",
            "-ms-transform": "none"
        };
        return rotationStyle
    }
    function setRotation(angle) {
        var M11, M12, M21, M22, deg2rad, rad;
        deg2rad = Math.PI * 2 / 360;
        rad = angle * deg2rad;
        M11 = Math.cos(rad);
        M12 = Math.sin(rad);
        M21 = Math.sin(rad);
        M22 = Math.cos(rad);
        var rotationStyle = {
            "-webkit-transform": "rotate(" + parseInt(angle, 10) + "deg)",
            "-moz-transform": "rotate(" + parseInt(angle, 10) + "deg)",
            "-o-transform": "rotate(" + parseInt(angle, 10) + "deg)",
            "-ms-transform": "rotate(" + parseInt(angle, 10) + "deg)"
        };
        return rotationStyle
    }
    function cleanValue(value) {
        if (typeof value === "string") {
            if (value.toLowerCase().indexOf("px") === -1) {
                return value + "px"
            } else {
                return value
            }
        } else {
            return value + "px"
        }
    }
    function setCookie(cName, value, exdays) {
        var exdate = new Date;
        exdate.setDate(exdate.getDate() + exdays);
        var cValue = encodeURIComponent(value) + (exdays == null ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = [cName, "=", cValue].join("")
    }
    function getCookie(cName) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x === cName) {
                return decodeURIComponent(y)
            }
        }
    }
    function isLastStep() {
        return _index === _activeWalkthrough.steps.length - 1|| _index ===  _activeWalkthrough.steps.length
    }
    function isStartStep(){
        return _index != 0
    }
    function isFirstStep() {
        return _index === 0
    }
    function isNextStep(){
        return _index === _activeWalkthrough.steps.length - 1 || _index ===0
    }
    function getScrollParent(element) {
        if (!(element instanceof $)) {
            element = $(element)
        }
        element = element.first();
        var position = element.css("position"),
            excludeStaticParent = position === "absolute",
            scrollParent = element.parents().filter(function() {
                var parent = $(this);
                if (excludeStaticParent && parent.css("position") === "static") {
                    return false
                }
                return /(auto|scroll)/.test(parent.css("overflow") + parent.css("overflow-y") + parent.css("overflow-x"))
            }).eq(0);

        var body=document.getElementsByTagName("body")[0];
        var isWebkit;
        isWebkit = typeof body.style.WebkitAnimation != "undefined";
        return position === "fixed" ? $() : !scrollParent.length ? $(isWebkit ? "body": "html") : scrollParent
    }
    $(document).on("click", "#jpwClose",function () {
        methods.close();
    });
    $(document).on("click", "#jpwFinish", function () {
        $.newbieGuide("finish");
        methods.close();
    });
    $(document).on("click", "#jpwNext, #jpwStart", function() {
        $.newbieGuide("next");
    });
    $(document).on("click", "#jpwPrevious", function() {
        $.newbieGuide("prev")
    });
    $(document).on("click", "#jpwOverlay, #jpwTooltip", function(ev) {
        ev.stopPropagation();
        ev.stopImmediatePropagation()
    });
    
    $.newbieGuide = $.fn.newbieGuide = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, [].slice.call(arguments, 1))
        } else if (typeof method === "object" || !method) {
            methods.init.apply(this, arguments);
            if (_hasDefault && _counter < 2) {
                setTimeout(function() {
                    methods.renderOverlay()
                }, 500)
            }
        } else {
            $.error("Method " + method + " does not exist on jQuery.newbieGuide")
        }
    };
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
})(jQuery, window, document);
