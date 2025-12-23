var currentCountry = null;
$(function () {
    var dataTooltipList = $("[data-toggle=tooltip]")
    for (var i = 0; i < dataTooltipList.length; i++) {
        var obj = dataTooltipList[i]
        var parent = $(obj).parent()
        $(obj).tooltip({
            container: parent
        })
    }

    init();
    initNoteForOldVersions();
    //getLocation();
    mutationObserverFunc();
    initPageLayout();

    const keyword = getUrlVars(document.URL)["q"] ? decodeURIComponent(getUrlVars(document.URL)["q"]) : null
    scrollToKeyword(keyword);

    $(window).resize(function () {
        var objs = $(".fold-panel-prefix")
        for (var i = 0; i < objs.length; i++) {
            var obj = $(".fold-panel-prefix").eq(i)
            $(obj).next().find('i').css({
                'width': ($(obj).next().width() - 24) + 'px'
            })
            $(obj).next().find('i').css({
                'height': $(obj).next().height() + 'px'
            })
            $(obj).next().find('i').css({
                'line-height': $(obj).next().height() + 'px'
            })
        }
        init()
        realFunc()
    })

    window.addEventListener('scroll', realFunc);

    $('.sideBarIcon').on("click", function () {
        $(".sideBar").toggleClass('hide-md');
        $(".sideBar").toggleClass('hide-sm');
        $(".sideBar").toggleClass('hide-xs');
        setTimeout(function () {
            $('#sideBarCnt').css({
                'width': $('.sideBar').width() + 'px'
            });
        }, 100)
    })

    $('#articleContent').on("click", function () {
        if ($(window).outerWidth() < 1200 && $(".sideBar").is(':visible')) {
            $(".sideBar").toggleClass('hide-md');
            $(".sideBar").toggleClass('hide-sm');
            $(".sideBar").toggleClass('hide-xs');
        }
    })

    $('.d-search').on('click', function(e) {
        e.stopPropagation()
    })

    $(document).on("click", function () {
        $('.otherVersions').hide();
        $('.fullVersionInfo').hide();
        $('.d-search-result').hide();
        if ($(".languageWrap").length > 0 && $(".languageWrap .languageSelectDown").is(":visible")) {
            $(".languageWrap .languageSelectDown").hide()
        }
    })

    $(document).delegate(".changeBtn", 'click', function (e) {
        $('.otherVersions').toggle();
        stopPropagation(e);
    })

    $(document).delegate(".fvChange", 'click', function (e) {
        $('.fullVersionInfo').toggle();
        stopPropagation(e);
    })

    $(document).delegate(".history .currentVersion", 'click', function (e) {
        $('.fullVersionInfo').slideToggle();
        stopPropagation(e);
    })

    $(document).delegate(".markdown-body .sample-code-prefix + blockquote ul li", 'click', function () {
        var index = $(this).index()
        var sIndex = $($(this).parent().parent()[0].previousSibling.previousSibling).index('.sample-code-prefix')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ul li').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ol li').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ul li').eq(index).addClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ol li').eq(index).addClass('on')

        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote > div').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote > div').eq(index).addClass('on')
    })

    $(document).delegate(".markdown-body .sample-code-prefix + blockquote ol li a", 'click', function () {
        copy($(this).parent().find('code').text())
    })

    $(document).delegate(".copy-prefix + p a", 'click', function () {
        copy($(this).parent().find('+ div code').text())
    })

    $(document).delegate(".rightMenuControlBtn", 'click', function () {
        $(this).toggleClass("hideMenuIcon")
        if ($(this).hasClass("hideMenuIcon")) {
            $(this).find("img").prop("title", "Show Sidebar").tooltip("fixTitle").tooltip("show")
        } else {
            $(this).find("img").prop("title", "Collapse Sidebar").tooltip("fixTitle").tooltip("show")
        }

        $('.docContainer .main, .rightSideMenu, .markdown-body').toggleClass('showRightSideMenu')
    })

    $(document).delegate(".markdown-body .highlight pre .copyIcon", 'click', function () {
        copy($(this).parent().find('code').text())
        $(this).addClass("copied").removeClass("fa").removeClass("fa-copy")
        let _this = $(this)
        setTimeout(function () {
            $(_this).removeClass("copied").addClass("fa").addClass("fa-copy")
        }, 2000)
    })

    $(document).delegate(".fold-panel-prefix + * i", 'click', function () {
        $(this).parent().find('.fa-caret-down').toggleClass('fa-caret-up')
        if ($(this).parent().next().hasClass('fold-panel-start')) {
            var foldPanel = $(this).parent().next();
            while (!foldPanel.hasClass('fold-panel-end')) {
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

    $(document).delegate("#fullTreeMenuListContainer li > a", "click", function (e) {
        if ($(this)[0].href == undefined || $(this)[0].href.trim() == "" || $(this).parent().find(" > ul").length > 0) {
            openChildMenuTree($(this), true)
        }
        e.stopPropagation()
    })

    $(document).delegate("#fullTreeMenuListContainer i.icon-arrow", "click", function (e) {
        openChildMenuTree($(this), true)
        e.stopPropagation()
    })

    if ($(".markdown-body .sample-code-prefix").length > 0 && (getUrlVars(document.URL)["lang"] || getUrlVars(document.URL)["src"])) {
        var langs = getUrlVars(document.URL)["lang"] ? getUrlVars(document.URL)["lang"].toLowerCase().trim().split(",") : getUrlVars(document.URL)["src"].split(",")
        if (langs) {
            if (langs.length == 1) {
                if (langs[0].toLowerCase() == "android") {
                    sampleCodeLangsInit(['kotlin', 'android'])
                } else {
                    sampleCodeSingleLangInit(langs[0])
                }
            } else {
                sampleCodeLangsInit(langs)
            }
        }
    }

    $(document).delegate(".fullVersionHistory .fullVersionInfo .hasChildLi", 'click', function (e) {
        $(this).toggleClass("expand")
        $(this).find("ul").slideToggle()
        e.stopPropagation()
    })

    $(".mainPage").on("wheel mousewheel", function (ev) {
        var $this = $(this),
            scrollTop = this.scrollTop,
            scrollHeight = this.scrollHeight,
            height = $this.innerHeight(),
            up = ev.originalEvent.wheelDelta > 0;
        if ((up && scrollTop == 0) || (!up && (scrollTop + height) >= scrollHeight)) {
            ev.preventDefault();
        }
    })

    $(document).delegate(".languageWrap.enableLanguageSelection .languageChange", 'click', function (e) {
        $(".languageWrap .languageSelectDown").toggle()
        e.stopPropagation()
    })

    $(document).delegate(".languageWrap.enableLanguageSelection .languageSelectDown > div", 'click', function (e) {
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

    $(document).delegate("#fullTreeMenuListContainer li > a", "mouseenter", function () {
        var title = $(this).attr("title")
        if (title == undefined || title == "") {
            $(this).prop("title", $(this).text())
        }
    })
})


function initPageLayout() {
    if ($(".headCounter").hasClass("noTitleIndex")) {
        $("#AutoGenerateSidebar").addClass("noTitleIndex")
    }
    if ($(".languageWrap.multiProgrammingLanguage").length > 0 && getCurrentUrlLang(document.URL, true) == "objectivec-swift") {
        var urlLang = getUrlVars(document.URL)["lang"]
        if (urlLang) {
            var lang = urlLang.split(",")[0]
            if (!$(".languageWrap").hasClass("enableLanguageSelection")) {
                lang = getSingleLangOfCurrentMobilePage()
            }
            $(".languageWrap .languageSelectDown > div").removeClass("on")
            let obj = $(".languageWrap .languageSelectDown > div")
            for (var i = 0; i < obj.length; i++) {
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
            for (var i = 0; i < obj.length; i++) {
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

    // download note
    if ($(".dbrThanksDownloading").length > 0) {
        $(".dbrThanksDownloading").append('<i class="icon-close" onclick="closeThanksDownloading()"></i>')
    }

    $('.sideBar, #docHead').addClass("hide-md")
    // sample code start
    $('.markdown-body .sample-code-prefix + blockquote > ul > li:first-child').addClass('on')
    $('.markdown-body .sample-code-prefix + blockquote > ol > li:first-child').addClass('on')

    var preList = $('.markdown-body .highlight pre')
    for (var i = 0; i < preList.length; i++) {
        var iconItem = document.createElement("i")
        iconItem.className = "copyIcon fa fa-copy"
        preList[i].appendChild(iconItem)
    }

    var template2Objs = $('.markdown-body .sample-code-prefix.template2 + blockquote')
    for (var i = 0; i < template2Objs.length; i++) {
        $(template2Objs[i]).find(">div").eq(0).addClass('on')
    }
    // sample code end

    if (document.URL.indexOf("web-twain/docs/faq/") > 0 && document.URL.indexOf("web-twain/docs/faq/?ver") < 0) {
        $("#breadcrumbLastNode").text($("h1").text())
    }

    var sd = $(window).scrollTop()
    if (sd > 0) {
        realFunc()
    } else {
        $('#AutoGenerateSidebar a').eq(0).addClass('active')
    }

    var hash = document.URL.split("#").length > 1 ? document.URL.split("#")[1].toLowerCase() : null
    hash = hash && hash.indexOf("?") > 0 ? hash.split("?")[0] : hash
    hash = hash && hash.indexOf("&") > 0 ? hash.split("&")[0] : hash
    if (hash && $("#" + hash.toLowerCase()).length > 0) {
        window.scrollTo(0, $("#" + hash.toLowerCase()).offset().top - 160)
    }

    setTimeout(function () {
        var objs = $(".fold-panel-prefix")
        for (var i = 0; i < objs.length; i++) {
            var obj = $(".fold-panel-prefix").eq(i)
            $(obj).next().find('i').css({
                'width': ($(obj).next().width() - 24) + 'px'
            })
            $(obj).next().find('i').css({
                'height': $(obj).next().height() + 'px'
            })
            $(obj).next().find('i').css({
                'line-height': $(obj).next().height() + 'px'
            })
            $(obj).next().find('i').css({
                'opacity': 1
            })
        }
    }, 500)
}

function realFunc() {
    if ($(window).scrollTop() > 0) {
        $("a#toTop").show()
    } else {
        $("a#toTop").hide()
    }
    var sd = $(window).scrollTop();
    if (breakpoint() == 'lg') {
        var subHeight = $('.subHeadWrapper').length > 0 ? $('.subHeadWrapper').height() : $('.productMenu').height();
        var menuHeight = $('#dynamsoft-header').height() + subHeight;
        var basicFullTreeIncrease = $(window).outerWidth() > 1680 ? 130 : 140
        if (sd > $('#dynamsoft-header').height()) {
            if ($('#footerWrapper').offset().top - $(document).scrollTop() < $(window).height()) {
                var offset = $('#footerWrapper').offset().top - $(document).scrollTop() - $(window).height()
                $('.mainPage').css({
                    'max-height': 'calc(100vh - ' + (subHeight + basicFullTreeIncrease - offset) + 'px)'
                });
            } else {
                $('.mainPage').css({
                    'max-height': 'calc(100vh - ' + (subHeight + basicFullTreeIncrease) + 'px)'
                });
            }
            // head and sidebar fixed
            if ($('.subHeadWrapper').length > 0) {
                $('.subHeadWrapper').css({
                    'top': '0px'
                });
                // $('#docHead').css({'top': ($('.subHeadWrapper').height() + 1) + 'px'});
                // $('.history').css({
                //     'top': $(window).outerWidth() > 1680 ? '100px' : '100px'
                // })
            } else if ($('.productMenu').length > 0) {
                // $('.productMenu').css({'top': '0px'});
                // $('#docHead').css({'top': ($('.productMenu').height()) + 'px'});
                // $('.history').css({
                //     'top': $(window).outerWidth() > 1680 ? '100px' : '100px'
                // })
            } else {
                // $('#docHead').css({'top': '0px'});
                // $('.history').css({
                //     'top': '30px'
                // })
            }
            if ($(window).outerWidth() > 1199) {
                $('.sideBar #sideBarCnt').addClass('sidebar-fixed');
            }
            $('.rightSideMenu').addClass('rsm-fixed');
        } else {
            if ($('#footerWrapper').offset().top - $(document).scrollTop() < $(window).height()) {
                $('.mainPage').css({
                    'max-height': 'calc(100vh - ' + (menuHeight + basicFullTreeIncrease) + 'px)'
                });
            } else {
                $('.mainPage').css({
                    'max-height': 'calc(100vh - ' + (menuHeight + basicFullTreeIncrease - sd) + 'px)'
                });
            }

            // head and sidebar fixed
            if ($('.subHeadWrapper').length > 0) {
                $('.subHeadWrapper').css({
                    'top': ($('#dynamsoft-header').height() - sd) + 'px'
                });
                $('.sideBar').css({
                    'padding-top': $('.subHeadWrapper').height() + 42 + 'px!important'
                });
                // $('.history').css({
                //     'top': ($('#dynamsoft-header').height() + $('.subHeadWrapper').height() + 30 + -sd) + 'px'
                // })
            } else if ($('.productMenu').length > 0) {
                // $('.productMenu').css({'top': ($('#dynamsoft-header').height()-sd) + 'px'});
                $('.sideBar').css({
                    'padding-top': $('.productMenu').height() + 42 + 'px!important'
                });
                // $('.history').css({
                //     'top': ($('#dynamsoft-header').height() + $('.productMenu').height() + 30 + -sd) + 'px'
                // })
            } else {
                $('.sideBar').css({
                    'padding-top': +'42px!important'
                });
                // $('.history').css({
                //     'top': ($('#dynamsoft-header').height() + 30 + -sd) + 'px'
                // })
            }
            // $('#docHead').css({'top': (menuHeight-sd)+1 + 'px'});
            $('.sideBar #sideBarCnt').removeClass('sidebar-fixed');
            $('.rightSideMenu').removeClass('rsm-fixed');
        }
    } else {
        $('.subHeadWrapper').css({
            'top': 'unset'
        });
        // $('.productMenu').css({'top': 'unset'});
        // $('#docHead').css({'top': 'unset'});
        $('.sideBar').css({
            'padding-top': '20px!important'
        });
    }

    if ($(window).outerWidth() < 992) {
        $('.docContainer .main, .rightSideMenu, .markdown-body').removeClass('showRightSideMenu')
    }

    // right menu active link 
    var title = []
    var tempTitle = document.querySelectorAll('.markdown-body h2');
    if ($('#fullTreeMenuListContainer').hasClass('needh3')) {
        tempTitle = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
    }
    for (let i = 0; i < tempTitle.length; i++) {
        if ($(tempTitle[i]).is(":visible")) {
            title.push(tempTitle[i])
        }
    }
    var rightNavItem = $('#AutoGenerateSidebar a');
    var flag = false
    for (i = 0; i < title.length; i++) {
        if ($(title[i]).is(":visible") && $(title[i]).offset().top - 170 <= sd) {
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

function openChildMenuTree(obj, needIcon) {
    var curLi = $(obj).parent()
    var curLiLevel = getCurrentMenuObjLevel(curLi)
    $(curLi).attr("data-level", curLiLevel);
    if (curLiLevel >= 5) {
        var randomId = Math.random().toString(36).substring(2);
        var needUL = findNearestLevel5(curLi, curLiLevel);
        needUL = needUL && needUL.length > 0 ? needUL[0] : null;
        if (needUL) {
            $(needUL).attr("id", "child-" + randomId)
            $(needUL).parent().attr("id", randomId)
            $(needUL).prepend(`<li class="subsetBtnLine"><a class="refreshLink" data-randomId="${randomId}" href="javascript:;" onclick="onSubsetBtnLineClick('${randomId}')">......<span>Show parent</span></a></li>`)
            var objs = $(needUL).parents("li")
            for (var i = 0; i < objs.length; i++) {
                if ($(objs[i]).parent().is("#fullTreeMenuListContainer")) {
                    $(objs[i]).find("> ul").addClass("hide_overlimit5")
                    $(objs[i]).attr("data-opensubset", "true")
                    $(objs[i]).append(needUL)
                }
            }
        }
    }

    if (needIcon && $(obj).parent().hasClass("collapseListStyle")) {
        var childLis = $(obj).parent().find(">ul>li")
        for (var i = 0; i < childLis.length; i++) {
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

    if (curLiLevel == 1 && $(curLi).attr("data-opensubset") == "true") {
        $(curLi).removeAttr("data-opensubset")
        var randomId = $(curLi).find(".subsetBtnLine > a").data("randomid")
        onSubsetBtnLineClick(randomId, true)
    }
}

function sampleCodeLangsInit(langs, isInModal = false) {
    var langTexts = langs.map(function (lang) {
        // lang to langText
        return getlangText(lang)
    }).filter(function (lang) {
        // delete null
        return lang
    })
    var index = 1
    for (var i = 0; i < langTexts.length; i++) {
        var langText = langTexts[i]
        if (langText) {
            var isFind = sampleCodeSingleLangInit(null, langText, index, isInModal)
            isFind && index++
        }
    }
    $(".scChoosedLi").removeClass("scHiddenLi")
}

function sampleCodeSingleLangInit(lang, langText, index, isInModal = false) {
    var isFindItem = false
    langText = langText || getlangText(lang)
    var sampleCodeList = $(".markdown-body .sample-code-prefix + blockquote")
    if (isInModal) {
        sampleCodeList = $("#docsModal .markdown-body .sample-code-prefix + blockquote")
    }
    if (langText) {
        for (var i = 0; i < sampleCodeList.length; i++) {
            var scLis = $(sampleCodeList[i]).find("ul li")
            for (var j = 0; j < scLis.length; j++) {
                var a = scLis[j].textContent.toLowerCase()
                var b = langText.toLowerCase()
                if (a == b) {
                    isFindItem = true
                    $(scLis[j]).addClass("scChoosedLi")
                    if (!index || index == 1) {
                        $(scLis[j]).trigger("click")
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
    return isFindItem
}

function getlangText(lang) {
    var langText = null
    switch (lang) {
        case 'javascript':
        case 'js':
            langText = 'JavaScript'
            break;
        case 'c':
            langText = 'C'
            break;
        case 'cpp':
        case 'c++':
        case 'cplusplus':
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
        case 'xamarin':
            langText = 'Xamarin'
            break;
        case 'maui':
            langText = 'MAUI'
            break;
        case 'react-native':
            langText = 'React Native'
            break;
        case 'flutter':
            langText = 'Flutter'
            break;
        case 'cordova':
            langText = 'Cordova'
            break;
        case 'kotlin':
            langText = 'Kotlin'
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
    var menuHeight = $('#dynamsoft-header').height() + subHeight;
    var sd = $(window).scrollTop();
    var basicFullTreeIncrease = $(window).outerWidth() > 1680 ? 130 : 140
    $('#sideBarCnt').css({
        'width': $('.sideBar').width() + 'px'
    });
    $('.mainPage').css({
        'min-height': 'calc(100vh - ' + (menuHeight + basicFullTreeIncrease - 60 + $("#footerWrapper").height()) + 'px)'
    });
    $('.mainPage').css({
        'max-height': 'calc(100vh - ' + (menuHeight + basicFullTreeIncrease) + 'px)'
    });
    // $('.rightSideMenu').css({
    //     'padding-top': $('#docHead').outerHeight() + 'px'
    // });
    // $('.docContainer .markdown-body').css({'margin-top': ($('#docHead').outerHeight() + 0) + 'px'});
    if ($(window).outerWidth() > 1200) {
        // $('.history').css({'width': $('#txtSearch').outerWidth() + 'px'});
        $('.history').removeClass('history-absolute');
        if (sd > $('#dynamsoft-header').height()) {
            if ($('#footerWrapper').offset().top - $(document).scrollTop() < $(window).height()) {
                var offset = $('#footerWrapper').offset().top - $(document).scrollTop() - $(window).height()
                $('.mainPage').css({
                    'max-height': 'calc(100vh - ' + (subHeight + basicFullTreeIncrease - offset) + 'px)'
                });
            } else {
                $('.mainPage').css({
                    'max-height': 'calc(100vh - ' + (subHeight + basicFullTreeIncrease) + 'px)'
                });
            }
        } else {
            $('.mainPage').css({
                'max-height': 'calc(100vh - ' + (menuHeight + basicFullTreeIncrease - sd) + 'px)'
            });
        }
    } else {
        if ($(window).outerWidth() > 991) {
            $('.mainPage').css({
                'min-height': 'calc(100vh - ' + (menuHeight + basicFullTreeIncrease) + 'px)'
            });
        }
        // $('.history').css({
        //     'width': '165px'
        // });
        // $('.history').addClass('history-absolute');
    }

    $("h2 > a.anchorjs-link , h3 > a.anchorjs-link , h4 > a.anchorjs-link").on("click", function (e) {
        e.preventDefault()
        var offsetTop = $(this).offset().top
        window.scrollTo(0, offsetTop - 160)
    })

    // if ($(window).outerWidth() > 1680) {
    //     if (breakpoint() == 'lg') {
    //         $('.markdown-body h2').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
    //         $('.markdown-body h2').css({'margin-top': -$('#docHead').outerHeight() - 70 + 'px'})
    //         $('.markdown-body h3').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
    //         $('.markdown-body h3').css({'margin-top': -$('#docHead').outerHeight() - 90 + 'px'})
    //         $('.markdown-body h4').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
    //         $('.markdown-body h4').css({'margin-top': -$('#docHead').outerHeight() - 90 + 'px'})
    //         $('.markdown-body h5').css({'padding-top': $('#docHead').outerHeight() + 110 + 'px'})
    //         $('.markdown-body h5').css({'margin-top': -$('#docHead').outerHeight() - 100 + 'px'})
    //     }
    // } else {
    //     if (breakpoint() == 'lg') {
    //         $('.markdown-body h2').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
    //         $('.markdown-body h2').css({'margin-top': -$('#docHead').outerHeight() - 60 + 'px'})
    //         $('.markdown-body h3').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
    //         $('.markdown-body h3').css({'margin-top': -$('#docHead').outerHeight() - 70 + 'px'})
    //         $('.markdown-body h4').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
    //         $('.markdown-body h4').css({'margin-top': -$('#docHead').outerHeight() - 80 + 'px'})
    //         $('.markdown-body h5').css({'padding-top': $('#docHead').outerHeight() + 90 + 'px'})
    //         $('.markdown-body h5').css({'margin-top': -$('#docHead').outerHeight() - 80 + 'px'})
    //     } else {
    //         $('.markdown-body h2').css({'padding-top': '90px'})
    //         $('.markdown-body h2').css({'margin-top': '-60px'})
    //         $('.markdown-body h3').css({'padding-top': '90px'})
    //         $('.markdown-body h3').css({'margin-top': '-60px'})
    //         $('.markdown-body h4').css({'padding-top': '90px'})
    //         $('.markdown-body h4').css({'margin-top': '-80px'})
    //         $('.markdown-body h5').css({'padding-top': '90px'})
    //         $('.markdown-body h5').css({'margin-top': '-80px'})
    //     }
    // }

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
    for (var i = 0; i < objs.length; i++) {
        var obj = $(".fold-panel-prefix").eq(i)
        $(obj).next().find('i').css({
            'width': ($(obj).next().width() - 24) + 'px'
        })
        $(obj).next().find('i').css({
            'height': $(obj).next().height() + 'px'
        })
        $(obj).next().find('i').css({
            'line-height': $(obj).next().height() + 'px'
        })
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
        url: GLOBAL.SiteRoot + "/Api/Location/Get",
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
    var ref = getUrlVars(document.URL)["ref"]
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

function closeThanksDownloading() {
    $(".dbrThanksDownloading").hide()
}

function initNoteForOldVersions(historyList = null) {
    VideoListener()
    // let latestPageUri = $("#latestPageUri").val()
    // let queryProduct = getUrlVars(document.URL)["product"] ? getUrlVars(document.URL)["product"] : getCurrentUrlProductName(document.URL)
    // if (queryProduct == "dbr") {
    //     let queryLang = getCurrentUrlLang(document.URL, true)
    //     if ($(".currentVersion").length > 0) {
    //         let currentVersion = $(".currentVersion").text().toLowerCase()
    //         currentVersion = currentVersion.indexOf("latest version") >= 0 ? "latest" : (currentVersion.replace("version ", ""))
    //         let majorVersion = currentVersion != "latest" ? Number(currentVersion.split(".")[0]) : "latest"
    //         if ((queryLang == "js" || queryLang == "javascript") && (majorVersion != "latest" && majorVersion <= 9 || latestPageUri && latestPageUri != "")) {
    //             loadOldVersionNotes(latestPageUri, queryProduct, queryLang, historyList);
    //         } else {
    //             $("#versionNote").remove()
    //         }
    //     }
    // }
}

function loadOldVersionNotes(latestPageUri, product, lang, historyList = null) {
    let isShowVersionNotes = false
    if (!latestPageUri || latestPageUri == "") {
        let historyLists = historyList ? historyList : $("#categoryMenuTree_history .otherVersions li")
        let flag = false
        for (let i = 0; i < historyLists.length; i++) {
            let versionText = $(historyLists[i]).find("a").text().toLowerCase()
            if (versionText.indexOf("latest") >= 0) {
                latestPageUri = $(historyLists[i]).find("a")[0].href
                flag = true
            }
        }
        if (!flag) {
            latestPageUri = location.origin + location.pathname
        }
    } else {
        isShowVersionNotes = true
    }

    if (latestPageUri.indexOf(location.origin) >= 0 && latestPageUri.indexOf("/docs/") > 0) {
        if (getCurrentUrlProductName(latestPageUri) != product) {
            latestPageUri += ("?product=" + product + "&lang=" + lang)
        }
        if (getCurrentUrlProductName(latestPageUri) == product && getCurrentUrlLang(latestPageUri, true) != lang) {
            latestPageUri += ("?lang=" + lang)
        }
    }

    if ($("#versionNote").length == 0) {
        if (isShowVersionNotes) {
            let noteHtml = `
                <div id="versionNote" style="width: 100%; padding: 20px; background: #b42727; color: #ffffff;border-radius: 5px;">This is the archived documentation. For the latest version, please visit <a class="noVersionAdd refreshLink" href="${latestPageUri}" style="color: #ffffff;text-decoration: underline !important;">this link</a>.
            `
            $(".markdown-body").prepend(noteHtml)
        } else {
            let productCurrentVersion = $(".currentVersion").text().toLowerCase()
            productCurrentVersion = productCurrentVersion.indexOf("latest version") >= 0 ? "latest" : (productCurrentVersion.replace("version ", ""))
            let productLatestVersion = getProductLangLatestVersion(product, lang)
            let noteHtml = `
                <div id="versionNote" style="width: 100%; padding: 20px; background: #b42727; color: #ffffff;border-radius: 5px;">This is the archived documentation for <span id="versionNoteOldVersion">${productCurrentVersion}</span>. If you are using the latest version<span id="versionNoteLatestVersion"> ${productLatestVersion}</span>, please visit <a class="noVersionAdd refreshLink" href="${latestPageUri}" style="color: #ffffff;text-decoration: underline !important;">this link</a>.
            `
            $(".markdown-body").prepend(noteHtml)
        }
    } else {
        $("#versionNote .noVersionAdd").prop("href", latestPageUri)
    }
}

function VideoListener() {
    let lazyVideos = [].slice.call(document.querySelectorAll("video.lazyload"));
    if ("IntersectionObserver" in window) {
        let lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (video) {
                if (video.isIntersecting) {
                    for (let source in video.target.children) {
                        let videoSource = video.target.children[source];
                        if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                            videoSource.src = videoSource.dataset.src;
                        }
                    }
                    video.target.load();
                    video.target.classList.remove("lazyload");
                    lazyVideoObserver.unobserve(video.target);
                }
            });
        });
        lazyVideos.forEach(function (video) {
            lazyVideoObserver.observe(video);
        });
    }
}

function scrollToKeyword(keyword) {
    if (!keyword) return;

    const lowerCaseKeyword = keyword.toLowerCase();
    const elements = document.querySelectorAll('article *:not(script):not(style)');  // 修正选择器

    for (let element of elements) {
        if (element.textContent.toLowerCase().includes(lowerCaseKeyword)) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightKeyword(keyword);  // 调用高亮
            return;  // 只滚动到第一个匹配项
        }
    }
}

function highlightKeyword(keyword) {
    if (!keyword) return;

    let lowerCaseKeyword = keyword.trim().toLowerCase().split(/\s+/);
    highlightWithinElement(document.querySelector('article'), lowerCaseKeyword);
}

function highlightWithinElement(element, lowerCaseKeyword) {
    function collectTextNodes(node) {
        let nodes = [];
        if (node.nodeType === Node.TEXT_NODE) {
            nodes.push(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            node.childNodes.forEach(child => {
                nodes = nodes.concat(collectTextNodes(child));
            });
        }

        return nodes;
    }

    let nodes = collectTextNodes(element);
    let combinedText = nodes.map(node => node.textContent).join('');
    const regex = new RegExp(lowerCaseKeyword.join("\\s*"), "gi");
    let matches = [...combinedText.matchAll(regex)];
    let matchIndex = 0;
    matches.forEach(match => {
        let matchStart = match.index;
        let matchEnd = matchStart + match[0].length;
        let currentIndex = 0;
        nodes.forEach(node => {
            let nodeText = node.textContent;
            let nodeLength = nodeText.length;
            if (currentIndex + nodeLength >= matchStart+1 && currentIndex <= matchEnd+1) {
                let beforeMatch = nodeText.substring(0, matchStart - currentIndex);
                let matchedText = nodeText.substring(matchStart - currentIndex, matchEnd - currentIndex);
                let afterMatch = nodeText.substring(matchEnd - currentIndex);
                let highlightedNode = document.createElement("span");
                matchStart = -1;
            }

            currentIndex += nodeLength;
        });
    });
}