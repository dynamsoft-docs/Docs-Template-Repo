var currentCountry = null;
$(document).ready(function(){ 
    init();
    getLocation();
    mutationObserverFunc();
    
    if ($(".headCounter").hasClass("noTitleIndex")) {
        $("#AutoGenerateSidebar").addClass("noTitleIndex")
    }

    // mobile - ios 页面
    if ($(".languageWrap.multiProgrammingLanguage").length > 0 && getCurrentUrlLang(document.URL, true) == "objectivec-swift") {
        // $(".languageWrap").show()
        var urlLang = getUrlVars(document.URL)["lang"]
        if (urlLang) {
            var lang = urlLang.split(",")[0]
            if (!$(".languageWrap").hasClass("enableLanguageSelection")) {
                lang = getSingleLangOfCurrentMobilePage()
            }
            $(".languageWrap .languageSelectDown > div").removeClass("on")
            let obj = $(".languageWrap .languageSelectDown > div")
            for(var i=0; i<obj.length;i++) {
                if ($(obj[i]).data("value") == lang) {
                    $(obj[i]).addClass("on")
                    $(".languageWrap .languageChange .chosenLanguage").text($(obj[i]).text())
                }
            }
            var href = document.URL.replace('lang' + urlLang, 'lang' + lang)
            history.replaceState(null, null, href)
            sampleCodeSingleLangInit(lang)
        } else {
            var curLang = "swift"
            if (!$(".languageWrap").hasClass("enableLanguageSelection")) {
                curLang = getSingleLangOfCurrentMobilePage()
            }
            $(".languageWrap .languageSelectDown > div").removeClass("on")
            let obj = $(".languageWrap .languageSelectDown > div")
            for(var i=0; i<obj.length;i++) {
                if ($(obj[i]).data("value") == curLang) {
                    $(obj[i]).addClass("on")
                    $(".languageWrap .languageChange .chosenLanguage").text($(obj[i]).text())
                }
            }
            if (document.URL.indexOf("?") > 0) {
                let tempHref = document.URL.split("?")
                var href = tempHref[0] + "?lang=" + curLang + '&' + tempHref[1]
                history.replaceState(null, null, href)
            } else if (document.URL.indexOf("#") > 0) {
                let tempHref = document.URL.split("#")
                var href = tempHref[0] + "?lang=" + curLang + '#' + tempHref[1]
                history.replaceState(null, null, href)
            } else {
                var href = document.URL + "?lang=" + curLang
                history.replaceState(null, null, href)
            }
            sampleCodeSingleLangInit(curLang)
        }
        
    }

    $('.sideBar, #docHead').addClass("hide-md")
    // sample code start
    $('.markdown-body .sample-code-prefix + blockquote > ul > li:first-child').addClass('on')
    $('.markdown-body .sample-code-prefix + blockquote > ol > li:first-child').addClass('on')

    var preList = $('.markdown-body .highlight pre')
    for (var i=0; i<preList.length; i++) {
        var iconItem = document.createElement("i")
        iconItem.className = "copyIcon fa fa-copy"
        preList[i].appendChild(iconItem)
    }

    var template2Objs = $('.markdown-body .sample-code-prefix.template2 + blockquote')
    for (var i=0; i<template2Objs.length; i++) {
        $(template2Objs[i]).find(">div").eq(0).addClass('on')
    }
    // sample code end

    if (document.URL.indexOf("web-twain/docs/faq/") > 0  && document.URL.indexOf("web-twain/docs/faq/?ver") < 0) {
        $("#breadcrumbLastNode").text($("h1").text())
    }

    var sd = $(window).scrollTop()
    if(sd > 0) {
        realFunc()
    } else {
        $('#AutoGenerateSidebar a').eq(0).addClass('active')
    }

    var hash = document.URL.split("#").length > 1 ? document.URL.split("#")[1].toLowerCase() : null
    hash = hash && hash.indexOf("?") > 0 ? hash.split("?")[0] : hash
    hash = hash && hash.indexOf("&") > 0 ? hash.split("&")[0] : hash
    if (hash && $("#" + hash.toLowerCase()).length > 0) {
        window.scrollTo(0, $("#" + hash.toLowerCase()).offset().top)
    }
    
    setTimeout(function() {
        var objs = $(".fold-panel-prefix")
        for(var i = 0; i<objs.length; i++) {
            var obj = $(".fold-panel-prefix").eq(i)
            $(obj).next().find('i').css({'width': ($(obj).next().width() - 24) + 'px'})
            $(obj).next().find('i').css({'height': $(obj).next().height() + 'px'})
            $(obj).next().find('i').css({'line-height': $(obj).next().height() + 'px'})
            $(obj).next().find('i').css({'opacity': 1})
        }
    }, 500)

    $(window).resize(function() {
        var objs = $(".fold-panel-prefix")
        for(var i = 0; i<objs.length; i++) {
            var obj = $(".fold-panel-prefix").eq(i)
            $(obj).next().find('i').css({'width': ($(obj).next().width() - 24) + 'px'})
            $(obj).next().find('i').css({'height': $(obj).next().height() + 'px'})
            $(obj).next().find('i').css({'line-height': $(obj).next().height() + 'px'})
        }
        init()
        realFunc()
    })

    window.addEventListener('scroll', realFunc);

    function realFunc() {
        if ($(window).scrollTop() > 0) {
            $("a#toTop").show()
        } else {
            $("a#toTop").hide()
        }
        
        $('.rightSideMenu').css({'padding-top': $('#docHead').outerHeight()+'px'});
        if (breakpoint() == 'lg') {
            var subHeight = $('.subHeadWrapper').length > 0 ? $('.subHeadWrapper').height() : $('.productMenu').height();
            var menuHeight = $('#overall-header').height() + subHeight;
            var sd = $(window).scrollTop();
            var basicFullTreeIncrease = $(window).outerWidth() > 1680 ? 130 : 140
            if (sd > $('#overall-header').height()) {
                if ($('#footerWrapper').offset().top - $(document).scrollTop() < $(window).height()) {
                    var offset = $('#footerWrapper').offset().top - $(document).scrollTop() - $(window).height()
                    $('.mainPage').css({'max-height': 'calc(100vh - '+(subHeight + basicFullTreeIncrease - offset) +'px)'});
                } else {
                    $('.mainPage').css({'max-height': 'calc(100vh - '+(subHeight + basicFullTreeIncrease) +'px)'});
                }
                // head and sidebar fixed
                if ($('.subHeadWrapper').length > 0) {
                    $('.subHeadWrapper').css({'top': '0px'});
                    $('#docHead').css({'top': ($('.subHeadWrapper').height() + 1) + 'px'});
                    $('.history').css({'top': $(window).outerWidth() > 1680 ? '119px' : '99px'})
                } else if ($('.productMenu').length > 0) {
                    $('.productMenu').css({'top': '0px'});
                    $('#docHead').css({'top': ($('.productMenu').height()) + 'px'});
                    $('.history').css({'top': $(window).outerWidth() > 1680 ? '119px' : '99px'})
                } else {
                    $('#docHead').css({'top': '0px'});
                    $('.history').css({'top': '30px'})
                }
                if ($(window).outerWidth() > 1199) {
                    $('.sideBar #sideBarCnt').addClass('sidebar-fixed');
                }
                $('.rightSideMenu').addClass('rsm-fixed');
            } else {
                if ($('#footerWrapper').offset().top - $(document).scrollTop() < $(window).height()) {
                    $('.mainPage').css({'max-height': 'calc(100vh - '+(menuHeight + basicFullTreeIncrease) +'px)'});
                } else {
                    $('.mainPage').css({'max-height': 'calc(100vh - '+(menuHeight + basicFullTreeIncrease - sd) +'px)'});
                }
                
                // head and sidebar fixed
                if ($('.subHeadWrapper').length > 0) {
                    $('.subHeadWrapper').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.subHeadWrapper').height() + 42 + 'px!important'});
                    $('.history').css({'top': ($('#overall-header').height() + $('.subHeadWrapper').height() + 30 +  - sd) + 'px'})
                } else if ($('.productMenu').length > 0) {
                    $('.productMenu').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.productMenu').height() + 42 + 'px!important'});
                    $('.history').css({'top': ($('#overall-header').height() + $('.productMenu').height() + 30 +  - sd) + 'px'})
                } else {
                    $('.sideBar').css({'padding-top':  + '42px!important'});
                    $('.history').css({'top': ($('#overall-header').height() + 30 +  - sd) + 'px'})
                }
                $('#docHead').css({'top': (menuHeight-sd)+1 + 'px'});
                $('.sideBar #sideBarCnt').removeClass('sidebar-fixed');
                $('.rightSideMenu').removeClass('rsm-fixed');
            }
        } else {
            $('.subHeadWrapper').css({'top': 'unset'});
            $('.productMenu').css({'top': 'unset'});
            $('#docHead').css({'top': 'unset'});
            $('.sideBar').css({'padding-top': '20px!important'});
        }

        if ($(window).outerWidth() < 992) {
            $('.docContainer .main, .rightSideMenu, .markdown-body').removeClass('showRightSideMenu')
        }

        // right menu active link
        var title = document.querySelectorAll('.markdown-body h2');
        if ($('#fullTreeMenuListContainer').hasClass('needh3')) {
            title = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
        }
        var rightNavItem = $('#AutoGenerateSidebar a');
        var flag = false
        for(i=0; i<title.length; i++){
            if($(title[i]).offset().top - 100 <= sd) {
                flag = true
                $('#AutoGenerateSidebar a').removeClass("active");
                $(rightNavItem[i]).addClass("active");
            }
        }
        if (!flag) {
            $('#AutoGenerateSidebar a').removeClass("active");
            $(rightNavItem[0]).addClass("active");
        }
    }

    $('.sideBarIcon').click(function() {
        $(".sideBar").toggleClass('hide-md');
        $(".sideBar").toggleClass('hide-sm');
        $(".sideBar").toggleClass('hide-xs');
        setTimeout(function() {
            $('#sideBarCnt').css({'width': $('.sideBar').width() + 'px'});
        }, 100)
    })

    $('#articleContent').click(function() {
        if ($(window).outerWidth() < 1200 && $(".sideBar").is(':visible')) {
            $(".sideBar").toggleClass('hide-md');
            $(".sideBar").toggleClass('hide-sm');
            $(".sideBar").toggleClass('hide-xs');
        }
    })

    $(document).click(function(){
        $('.otherVersions').hide();
        $('.fullVersionInfo').hide();
        if ($(".languageWrap").length > 0 && $(".languageWrap .languageSelectDown").is(":visible")) {
            $(".languageWrap .languageSelectDown").hide()
        }
    })

    $('.changeBtn').on('click', function(e) {
        $('.otherVersions').toggle();
        stopPropagation(e);
    })

    $('.fvChange').on('click', function(e) {
        $('.fullVersionInfo').toggle();
        stopPropagation(e);
    })

    $('.history .currentVersion').on('click', function(e) {
        $('.fullVersionInfo').slideToggle();
        stopPropagation(e);
    })

    $(document).delegate(".markdown-body .sample-code-prefix + blockquote ul li", 'click', function() {
        var index = $(this).index()
        var sIndex = $($(this).parent().parent()[0].previousSibling.previousSibling).index('.sample-code-prefix')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ul li').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ol li').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ul li').eq(index).addClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ol li').eq(index).addClass('on')

        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote > div').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote > div').eq(index).addClass('on')
    })

    $(document).delegate(".markdown-body .sample-code-prefix + blockquote ol li a", 'click', function() {
        copy($(this).parent().find('code').text())
    })

    $(document).delegate(".copy-prefix + p a", 'click', function() {
        copy($(this).parent().find('+ div code').text())
    })

    $(document).delegate(".rightMenuControlBtn", 'click', function() {
        $('.docContainer .main, .rightSideMenu, .markdown-body').toggleClass('showRightSideMenu')
    })

    $(document).delegate(".markdown-body .highlight pre .copyIcon", 'click', function() {
        copy($(this).parent().find('code').text())
        $(this).addClass("copied").removeClass("fa").removeClass("fa-copy")
        let _this = $(this)
        setTimeout(function() {
            $(_this).removeClass("copied").addClass("fa").addClass("fa-copy")
        }, 2000)
    })

    $(document).delegate(".fold-panel-prefix + * i", 'click', function() {
        $(this).parent().find('.fa-caret-down').toggleClass('fa-caret-up')
        if ($(this).parent().next().hasClass('fold-panel-start')) {
            var foldPanel = $(this).parent().next();
            while(!foldPanel.hasClass('fold-panel-end')) {
                if (!foldPanel.hasClass('fold-panel-start')) {
                    $(foldPanel).toggle()
                }
                foldPanel = $(foldPanel).next()
            }
        }
    })

    $('#toTop').click(function () {
        window.scrollTo(0, 0)
    })

    $(document).delegate("#categoryMenuTree li > a", "click", function(e) {
        if ($(this)[0].href == undefined || $(this)[0].href.trim() == "" || $(this).parent().find(" > ul").length > 0) {
            openChildMenuTree($(this), true)
        }
        e.stopPropagation()
    })

    $(document).delegate("#categoryMenuTree i.icon-arrow", "click", function(e) {
        openChildMenuTree($(this), true)
        e.stopPropagation()
    })

    if($(".markdown-body .sample-code-prefix").length > 0 && getUrlVars(document.URL)["lang"]) {
        var langs = getUrlVars(document.URL)["lang"].toLowerCase().trim().split(",")
        if (langs) {
            if (langs.length == 1) {
                sampleCodeSingleLangInit(langs[0])
            } else {
                sampleCodeLangsInit(langs)
            }
        }
    }

    $(".fullVersionHistory .fullVersionInfo .hasChildLi").on("click", function(e) {
        $(this).toggleClass("expand")
        $(this).find("ul").slideToggle()
        e.stopPropagation()
    })

    $(".mainPage").on("wheel mousewheel", function(ev) {
        var $this = $(this),
            scrollTop = this.scrollTop,
            scrollHeight = this.scrollHeight,
            height = $this.innerHeight(),
            up = ev.originalEvent.wheelDelta > 0;
        if ((up && scrollTop == 0) || (!up && (scrollTop + height) >= scrollHeight)) {
            ev.preventDefault();
        }
    })

    $(document).delegate(".languageWrap.enableLanguageSelection .languageChange", 'click', function(e) {
        $(".languageWrap .languageSelectDown").toggle()
        e.stopPropagation()
    })

    $(document).delegate(".languageWrap.enableLanguageSelection .languageSelectDown > div", 'click', function(e) {
        let value = $(this).data('value')
        $(".languageWrap .languageChange .chosenLanguage").text($(this).text())
        $(".languageWrap .languageSelectDown > div").removeClass("on")
        $(this).addClass('on')
        sampleCodeSingleLangInit(value)
        var urlLang = getUrlVars(document.URL)["lang"]
        if (urlLang) {
            var href = document.URL.replace('lang=' + urlLang, 'lang=' + value)
            history.replaceState(null, null, href)
        }
        e.stopPropagation()
    })
})

function openChildMenuTree(obj, needIcon) {
    if (needIcon && $(obj).parent().hasClass("collapseListStyle")) {
        var childLis = $(obj).parent().find(">ul>li")
        for(var i=0; i<childLis.length;i++) {
            if ($(childLis[i]).find("ul").length > 0) {
                $(childLis[i]).removeClass("expandListStyle").addClass("collapseListStyle")
                $(childLis[i]).find(">ul").slideUp()
                if ($(childLis[i]).find(".icon-arrow").length == 0) {
                    var iconItem = document.createElement("i")
                    iconItem.className = "icon-arrow"
                    childLis[i].appendChild(iconItem)
                }
            }
        }
    }

    if ($(obj).parent().hasClass("collapseListStyle")) {
        $(obj).parent().removeClass("collapseListStyle").addClass("expandListStyle")
        $(obj).parent().find(">ul").slideDown()
    } else {
        if ($(obj).parent().find(".activeLink") && !$(obj).hasClass("activeLink") && $(obj)[0].href) {

        } else {
            $(obj).parent().removeClass("expandListStyle").addClass("collapseListStyle")
            $(obj).parent().find(">ul").slideUp()
        }
    }
}

function sampleCodeLangsInit(langs) {
    var langTexts = langs.map(function(lang) {
        // lang to langText
        return getlangText(lang)
    }).filter(function(lang) {
        // delete null
        return lang
    })
    for (var i=0; i<langTexts.length; i++) {
        var langText = langTexts[i]
        if (langText) {
            sampleCodeSingleLangInit(null, langText, i+1)
        }
    }
    $(".scChoosedLi").removeClass("scHiddenLi")
}

function sampleCodeSingleLangInit(lang, langText, index) {
    langText = langText || getlangText(lang)
    var sampleCodeList = $(".markdown-body .sample-code-prefix + blockquote")
    if (langText) {
        for (var i=0; i < sampleCodeList.length; i++) {
            var scLis = $(sampleCodeList[i]).find("ul li")
            for(var j=0;j<scLis.length;j++) {
                if (scLis[j].textContent.toLowerCase() == langText.toLowerCase()) {
                    $(scLis[j]).addClass("scChoosedLi")
                    if (!index || index == 1) {
                        $(scLis[j]).click()
                        $(sampleCodeList[i]).find("ul li, ol li").addClass("scHiddenLi")
                        if ($(sampleCodeList[i]).parent().hasClass("template2")) {
                            $(sampleCodeList[i]).parent().find("blockquote > div").addClass("scHiddenLi")
                        }
                    }
                    if (!index && $(sampleCodeList[i]).find("ul .scHiddenLi.on").length == 1) {
                        $(sampleCodeList[i]).find("ul").hide()
                    }
                }
            }
        }
    }
}

function getlangText(lang) {
    var langText = null
    switch(lang) {
        case 'javascript':
        case 'js':
            langText = 'JavaScript'
            break;
        case 'c':
            langText = 'C'
            break;
        case 'cpp':
        case 'c++':
            langText = 'C++'
            break;
        case 'csharp':
        case 'dotnet':
            langText = 'C#'
            break;
        case 'java':
            langText = 'Java'
            break;
        case 'android':
            langText = 'Android'
            break;
        case 'objective-c':
        case 'objc':
            langText = 'Objective-C'
            break;
        case 'swift':
            langText = 'Swift'
            break;
        case 'python':
            langText = 'Python'
            break;
        default:
            langText = null
            break;
    }

    return langText
}

function copy(data) {
    let url = data;
    let oInput = document.createElement('textarea')
    oInput.value = url
    document.body.appendChild(oInput)
    oInput.select()
    document.execCommand("Copy");
    oInput.remove()
}

function init() {
    var subHeight = $('.subHeadWrapper').length > 0 ? $('.subHeadWrapper').height() : $('.productMenu').height();
    var menuHeight = $('#overall-header').height() + subHeight;
    var sd = $(window).scrollTop();
    var basicFullTreeIncrease = $(window).outerWidth() > 1680 ? 130 : 140
    $('#sideBarCnt').css({'width': $('.sideBar').width() + 'px'});
    $('.mainPage').css({'min-height': 'calc(100vh - '+(menuHeight + basicFullTreeIncrease - 60 + $("#footerWrapper").height()) +'px)'});
    $('.mainPage').css({'max-height': 'calc(100vh - '+(menuHeight + basicFullTreeIncrease) +'px)'});
    $('.rightSideMenu').css({'padding-top': $('#docHead').outerHeight()+'px'});
    $('.docContainer .markdown-body').css({'margin-top': ($('#docHead').outerHeight() + 0) + 'px'});2740
    if ($(window).outerWidth() > 1200) {
        $('.history').css({'width': $('#txtSearch').outerWidth() + 'px'});
        $('.history').removeClass('history-absolute');
        if (sd > $('#overall-header').height()) {
            if ($('#footerWrapper').offset().top - $(document).scrollTop() < $(window).height()) {
                var offset = $('#footerWrapper').offset().top - $(document).scrollTop() - $(window).height()
                $('.mainPage').css({'max-height': 'calc(100vh - '+(subHeight + basicFullTreeIncrease - offset) +'px)'});
            } else {
                $('.mainPage').css({'max-height': 'calc(100vh - '+(subHeight + basicFullTreeIncrease) +'px)'});
            }
        } else {
            $('.mainPage').css({'max-height': 'calc(100vh - '+(menuHeight + basicFullTreeIncrease -sd) +'px)'});
        }
    } else {
        if ($(window).outerWidth() > 991) {
            $('.mainPage').css({'min-height': 'calc(100vh - '+(menuHeight + basicFullTreeIncrease) +'px)'});
        }
        $('.history').css({'width': '170px'});
        $('.history').addClass('history-absolute');
    }
    if ($(window).outerWidth() > 1680) {
        if (breakpoint() == 'lg') {
            $('.markdown-body h2').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
            $('.markdown-body h2').css({'margin-top': -$('#docHead').outerHeight() - 80 + 'px'})
            $('.markdown-body h3').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
            $('.markdown-body h3').css({'margin-top': -$('#docHead').outerHeight() - 110 + 'px'})
            $('.markdown-body h4').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
            $('.markdown-body h4').css({'margin-top': -$('#docHead').outerHeight() - 110 + 'px'})
            $('.markdown-body h5').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
            $('.markdown-body h5').css({'margin-top': -$('#docHead').outerHeight() - 110 + 'px'})
        }
    } else {
        if (breakpoint() == 'lg') {
            $('.markdown-body h2').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
            $('.markdown-body h2').css({'margin-top': -$('#docHead').outerHeight() - 60 + 'px'})
            $('.markdown-body h3').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
            $('.markdown-body h3').css({'margin-top': -$('#docHead').outerHeight() - 90 + 'px'})
            $('.markdown-body h4').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
            $('.markdown-body h4').css({'margin-top': -$('#docHead').outerHeight() - 90 + 'px'})
            $('.markdown-body h5').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
            $('.markdown-body h5').css({'margin-top': -$('#docHead').outerHeight() - 90 + 'px'})
        } else {
            $('.markdown-body h2').css({'padding-top': '90px'})
            $('.markdown-body h2').css({'margin-top': '-60px'})
            $('.markdown-body h3').css({'padding-top': '90px'})
            $('.markdown-body h3').css({'margin-top': '-60px'})
            $('.markdown-body h4').css({'padding-top': '90px'})
            $('.markdown-body h4').css({'margin-top': '-90px'})
            $('.markdown-body h5').css({'padding-top': '90px'})
            $('.markdown-body h5').css({'margin-top': '-90px'})
        }
    }

    if ($(window).outerWidth() < 992) {
        $('.docContainer .main, .rightSideMenu, .markdown-body').removeClass('showRightSideMenu')
    }

    if ($("#categoryMenuTree").length > 0) {
        var scrollDiv = document.getElementsByClassName("mainPage")[0]
        if (scrollDiv.scrollHeight > scrollDiv.clientHeight && $(".activeLink").length > 0) {
            var activeLinkOffsetTop = $(".activeLink").offset().top - $(".mainPage").offset().top
            if (activeLinkOffsetTop - scrollDiv.scrollTop + 40 > scrollDiv.clientHeight) {
                scrollDiv.scrollTop = activeLinkOffsetTop - 200
            }
        }
    }
}

function initFoldPanel() {
    var objs = $(".fold-panel-prefix")
    for(var i = 0; i<objs.length; i++) {
        var obj = $(".fold-panel-prefix").eq(i)
        $(obj).next().find('i').css({'width': ($(obj).next().width() - 24) + 'px'})
        $(obj).next().find('i').css({'height': $(obj).next().height() + 'px'})
        $(obj).next().find('i').css({'line-height': $(obj).next().height() + 'px'})
    }
    $(".fold-panel-start").nextUntil(".fold-panel-end").hide()
}

function formatDate(date) {
    var weekdayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var newDate = new Date(date)
    var weekday = weekdayList[newDate.getDay()]
    var month = monthList[newDate.getMonth()]
    return weekday + ', ' + month + ' ' + newDate.getDate() + ', ' + newDate.getFullYear()
}

function getSingleLangOfCurrentMobilePage() {
    let singleLang = ""
    if ($(".language-swift").length > 0) {
        singleLang = "swift"
    } else {
        singleLang = "objc"
    }
    return singleLang
}

function getLocation() {
    $.ajax({
        url: "https://www.dynamsoft.com/api-common/Api/Location/Get",
        type: "get",
        success: function (res) {
            if (res.code == 0) {
                if (res.data) {
                    currentCountry = res.data;
                    if (currentCountry && currentCountry.countryCode == 'RU') {
                        $("#comm100-container").hide()
                    }
                }
            }
        },
    });
}

function mutationObserverFunc() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var mo = new MutationObserver(function (records) {
        records.forEach(function (record) {
            var obj = record.addedNodes[0]
            if ($(obj).attr("id") == "comm100-container") {
                if (currentCountry && currentCountry.countryCode == 'RU') {
                    $("#comm100-container").hide()
                }
            }
        })
    });

    mo.observe(document.body, {
        childList: true,
        subtree: true
    });
}

