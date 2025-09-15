var DcvProducts = ["dlr", "dce", "ddn", "dcv", "dcp"]
var isArchiveDocsLink = null
var FullTreePageDoc = null
var docsFolderName = "/docs/"
// #region about full tree
async function PageCreateInit(generateDocHead, needh3 = true, pageStartVer = undefined, useVersionTree = false) {
    await UrlReplace()
    FullTreeMenuList(generateDocHead, needh3, pageStartVer, useVersionTree)
}

//findVersionMatchItemInSearchList("10.2.1000", "javascript")
function findVersionMatchItemInSearchList(version, lang) {
    lang = lang == "cplusplus" ? "cpp" : lang
    lang = lang == "js" ? "javascript" : lang
    console.log(dcvVersionList)
    if (dcvVersionList) {
        let filteredItems = dcvVersionList.filter(function (item) {
            let productVersion = item.version
            let isReturn = false
            if (productVersion && getFormatVal(productVersion) <= getFormatVal(version)) {
                if (item.matchVersion) {
                    for (var matchItem in item.matchVersion) {
                        matchItem = matchItem == "cplusplus" ? "cpp" : matchItem
                        matchItem = matchItem == "js" ? "javascript" : matchItem
                        if (matchItem == lang) {
                            isReturn = true
                        }
                    }
                }
                if (item.matchList) {
                    for (var matchItem in item.matchList) {
                        matchItem = matchItem == "cplusplus" ? "cpp" : matchItem
                        matchItem = matchItem == "js" ? "javascript" : matchItem
                        if (matchItem == lang) {
                            isReturn = true
                        }
                    }
                }
            }
            return isReturn
        })

        filteredItems.sort(function (a, b) {
            return getFormatVal(b.productVersion) - getFormatVal(a.productVersion)
        })

        return filteredItems && filteredItems.length > 0 ? filteredItems[0] : null
    } else {
        return null
    }
}

function GenerateContentByHead(needh3 = true) {
    var titleList = [],
        tempTitleList, appendHtml = '<ul>';
    if (needh3) {
        tempTitleList = document.querySelectorAll('.content h2, .content h3');
    } else {
        tempTitleList = document.querySelectorAll('.content h2');
    }
    for (let i = 0; i < tempTitleList.length; i++) {
        if ($(tempTitleList[i]).is(":visible")) {
            titleList.push(tempTitleList[i])
        }
    }
    for (var i = 0; i < titleList.length; i++) {
        var curH2Text = $(titleList[i]).text();
        var curH2Href = $(titleList[i]).attr("id");
        var curliContent = '<li style="list-style-image: none; list-style-type: circle;"><a href="#' + curH2Href + '" class="otherLinkColour">' + curH2Text + '</a>';
        if (i + 1 < titleList.length && titleList[i].localName == 'h2' && titleList[i + 1].localName == 'h3') {
            curliContent += '<ul name="listLevel2">';
            for (var j = i + 1; j < titleList.length; j++) {
                if (titleList[j].localName == 'h3') {
                    i = j
                    var curH3Text = $(titleList[j]).text();
                    var curH3Href = $(titleList[j]).attr("id");
                    curliContent += '<li style="list-style-image: none; list-style-type: disc;"><a href="#' + curH3Href + '" class="otherLinkColour">' + curH3Text + '</a></li>';
                } else {
                    break;
                }
            }
            curliContent += '</ul>'
        } else {
            curliContent += '</li>'
        }
        appendHtml += curliContent
    }
    appendHtml += '</ul>'
    if ($('#AutoGenerateSidebar').length != 0) {
        $('#AutoGenerateSidebar').html("")
        $('#AutoGenerateSidebar').append(appendHtml);
        if ($("#AutoGenerateSidebar > ul > li").length == 0) {
            $(".rightSideMenu > p").hide()
        } else {
            $(".rightSideMenu > p").show()
        }
        var rightMenuATags = $("#AutoGenerateSidebar").find("a")
        for (var i = 0; i < rightMenuATags.length; i++) {
            rightMenuATags[i].onclick = function () {
                addParam(this, SearchVersion()[0], 'rightMenuContainer', needh3);
                return false;
            };
        }
    }
}

function FilterLangFullTree(needFilterLang = false) {
    // console.log("-------------- Start Filter Lang Full Tree --------------")
    // console.log(needFilterLang)
    var curUrl = document.URL
    if (curUrl.indexOf(`${docsFolderName}server/`) > 0 || curUrl.indexOf(`${docsFolderName}mobile/`) > 0 || needFilterLang) {
        var lang = getCurrentUrlLang(curUrl, needFilterLang);
        // console.log(lang)
        var fullTreeLis = $("#fullTreeMenuListContainer > li")
        for (var i = 0; i < fullTreeLis.length; i++) {
            var liItemLang = fullTreeLis[i].getAttribute("lang")
            if (liItemLang && liItemLang != "" && liItemLang.toLowerCase() != lang) {
                $(fullTreeLis[i]).attr("otherLang", true).hide()
                $(fullTreeLis[i]).find("li").attr("otherLang", true)
            } else {
                $(fullTreeLis[i]).removeAttr("otherLang").show()
                $(fullTreeLis[i]).find("li").removeAttr("otherLang")
            }
        }
    }
    // console.log("-------------- End Filter Lang Full Tree --------------")
}

function getSideBarIframeSrc(pageUrl, lang, product = null) {
    var reporType = getRepoTypeByLang(lang, pageUrl)
    product = product || getCurrentUrlProductName(pageUrl)
    product = DcvProducts.indexOf(product) >= 0 ? "dcv" : product
    if (getDoumentName(product)) {
        reporType = reporType == null ? 'core/' : reporType + "/"
        if (product == "lts" || product == "" || product == "mwc" || product == "ddv") {
            reporType = ""
        }
        if (isArchiveDocsLink && product == "dcv") {
            return '/' + getDoumentName(product) + '/docs-archive/' + reporType + 'Hide_Tree_Page.html'
        } else {
            return '/' + getDoumentName(product) + docsFolderName + reporType + 'Hide_Tree_Page.html'
        }
    }
    return null
}

function FullTreeMenuList(generateDocHead, needh3 = true, pageStartVer = undefined, useVersionTree = false) {
    // check if /docs/core && lang exist, update iframe src
    var pageUrl = document.URL;
    var needFilterLangTree = false;

    if (useVersionTree == 'true') {
        useVersionTree = true;
    } else if (useVersionTree == 'false') {
        useVersionTree = false;
    }
    if (generateDocHead == 'true') {
        generateDocHead = true;
    } else if (generateDocHead == 'false') {
        generateDocHead = false;
    }
    var verArray = SearchVersion();
    var product = getUrlVars(pageUrl)["product"] || getCurrentUrlProductName(pageUrl)
    if (!useVersionTree && DcvProducts.indexOf(product) < 0 && product != "dbr") {
        var allHerf1 = $(".docContainer .content, #docHead, #AutoGenerateSidebar, .sideBar, #crumbs").find("a");
        for (var i = 0; i < allHerf1.length; i++) {
            allHerf1[i].onclick = function () {
                if (!$(this).hasClass("refreshLink") && $(this).parents(".sideBar").length > 0 && $("#articleContent").length > 0) {
                    addParam(this, verArray[0], 'sidebar', needh3);
                } else if (!$(this).hasClass("refreshLink") && $(this).parents(".markdown-body").length > 0 && $("#articleContent").length > 0) {
                    addParam(this, verArray[0], 'docContainer', needh3);
                } else if (!$(this).hasClass("refreshLink") && $(this).parents("#AutoGenerateSidebar").length > 0) {
                    addParam(this, verArray[0], 'rightMenuContainer', needh3);
                } else if (!$(this).hasClass("refreshLink") && !$(this).hasClass("noVersionAdd")) {
                    addParam(this, verArray[0]);
                } else {
                    return true
                }
                return false;
            };
        }

        var navWrap = document.getElementById("fullTreeMenuListContainer");
        if (navWrap != null) {
            HighlightCurrentListForFullTree("fullTreeMenuListContainer", true, document.URL, pageStartVer, verArray[1]);
            if (generateDocHead) {
                if (needh3 == 'true') {
                    needh3 = true;
                } else if (needh3 == 'false') {
                    needh3 = false;
                }
                if (needh3) {
                    $('#fullTreeMenuListContainer').addClass('needh3');
                }
                GenerateContentByHead(needh3);
                //GenerateContentByHead(false);
            }
            var hiddenLayout = $('.docContainer, .sideBar, .history');
            for (var i = 0; i < hiddenLayout.length; i++) {
                hiddenLayout[i].style.visibility = "visible";
            }
            initFoldPanel();
            init();

            var treeHeight = $('#fullTreeMenuListContainer')[0].clientHeight;
            var treeOffsetTop = $('#fullTreeMenuListContainer').offset().top;
            var nodeOffsetTop = $('#fullTreeMenuListContainer .activeLink').length > 0 ? $('#fullTreeMenuListContainer .activeLink').offset().top : 0;
            var lineHeight = $('#fullTreeMenuListContainer .activeLink').length > 0 ? $('#fullTreeMenuListContainer .activeLink')[0].offsetHeight : 0;
            if (nodeOffsetTop > treeHeight + treeOffsetTop - lineHeight) {
                $('#fullTreeMenuListContainer').scrollTop(nodeOffsetTop - treeOffsetTop - lineHeight);
            }

            navWrap = document.getElementById("fullTreeMenuListContainer");
            var liAry = navWrap.getElementsByTagName("li");
            for (var i = 0, len = liAry.length; i < len; i++) {
                liAry[i].onclick = (function (i) {
                    return function (event) {
                        if ($(liAry[i]).children("a").length == 0 || $(liAry[i]).children("a")[0].getAttribute("href") == null) {
                            var subUl = $(liAry[i]).children("ul");
                            if (subUl.length > 0) {
                                for (var j = 0; j < subUl.length; j++) {
                                    if (subUl[j].style.display == "block") {
                                        var parentL = $(subUl[j]).parents("li");
                                        if (parentL.length > 0) {
                                            parentL[0].className = "collapseListStyle"
                                        }
                                        subUl[j].style.display = "none";
                                    } else {
                                        subUl[j].style.display = "block";
                                        var parentL = $(subUl[j]).parents("li");
                                        if (parentL.length > 0) {
                                            parentL[0].className = "expandListStyle"
                                        }
                                        var parentUl = $(liAry[i]).parents("ul");
                                        for (var m = 0; m < parentUl.length; m++) {
                                            if (parentUl[m].style.display != "block") {
                                                var parentL = $(parentUl[m]).parents("li");
                                                if (parentL.length > 0) {
                                                    parentL[0].className = "expandListStyle"
                                                }
                                                parentUl[m].style.display = "block";
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            //HighlightCurrentListForFullTree("fullTreeMenuListContainer", false, ($(liAry[i]).children("a"))[0].href);
                        }
                        event.stopPropagation();
                    }
                })(i)
            }
        }
    } else {
        if (getUrlVars(pageUrl)["product"] || getUrlVars(pageUrl)["lang"] || DcvProducts.indexOf(product) >= 0) {
            needFilterLangTree = true
        }
        
        var count = 0
        var fullTreeInterval = setInterval(function () {
            if (FullTreePageDoc || count >= 600) {
                clearInterval(fullTreeInterval)
                // Start Nav change
                // if page is dcv but used in ddn or other docs, need to change navbar
                // the nav bar in the (DDN or other docs's) Hide_Tree_Page.html file
                let productName = getCurrentUrlProductName(pageUrl)
                if (getUrlVars(pageUrl)["product"] || (getUrlVars(pageUrl)["lang"] && pageUrl.indexOf(`${docsFolderName}core/`) >= 0) || productName != "dcv" && DcvProducts.indexOf(productName) >= 0) {
                    var navBar = $(FullTreePageDoc).find('#docsNavBar');
                    if (navBar && navBar.length > 0) {
                        if (getUrlVars(pageUrl)["product"] || productName != "dcv" && DcvProducts.indexOf(productName) >= 0) {
                            var html = $(navBar[0]).html().replaceAll("mySearch", "mySearch2")
                            $(".productMenu").parent().html(html)
                        }
                        if (getUrlVars(pageUrl)["product"] && getCurrentUrlProductName() != getUrlVars(pageUrl)["product"]) {
                            var product = getUrlVars(pageUrl)["product"]
                            var productVersion = getUrlVars(pageUrl)[product]
                            if (productVersion != undefined) {
                                productVersion = findNearestVersion(productVersion)
                                $("p.currentVersion").text("Version " + productVersion)
                            }
                        }
                    }
                }
                // End Nav Change

                // Start Version Tree
                var version_tree_list = null
                var curPageVersion = verArray[0];
                curPageVersion = curPageVersion == 'latest' || curPageVersion == null ? 'latest_version' : curPageVersion;
                // if dcv docs but use in other docs, use other docs version
                var product = getUrlVars(document.URL)["product"]
                var productVersion = getUrlVars(document.URL)[product]
                var curProduct = getCurrentUrlProductName(document.URL)
                var curLang = getCurrentUrlLang(document.URL, true)

                //var productLatestVersion = getProductLangLatestVersion(product?product:curProduct, curLang)

                if (product && productVersion && curProduct != product) {
                    curPageVersion = (productVersion == 'latest' ? 'latest_version' : productVersion)
                }
                console.log("curPageVersion: " + curPageVersion)
                version_tree_list = $(FullTreePageDoc).find('#version_tree_list ul.version-tree-container');
                if (version_tree_list && version_tree_list.length > 0 && curPageVersion) {
                    var isFindVersionTree = false
                    var findIndex = 0
                    for (var i = 0; i < version_tree_list.length; i++) {
                        if (!isFindVersionTree) {
                            if ($(version_tree_list[i]).attr('id') == 'version_tree_' + curPageVersion) {
                                isFindVersionTree = true
                                findIndex = i
                            }
                            // if (curPageVersion == "latest_version" && $(version_tree_list[i]).attr('id') == 'version_tree_' + productLatestVersion) {
                            //     isFindVersionTree = true
                            //     findIndex = i
                            // }
                        }
                    }
                    $('#fullTreeMenuListContainer').html("");
                    var objs = $(version_tree_list[findIndex]).find("> li")
                    for (var j = 0; j < objs.length; j++) {
                        var itemLang = $(objs[j]).attr("lang")
                        if (!itemLang || itemLang.toLowerCase() == curLang.toLowerCase()) {
                            $('#fullTreeMenuListContainer').append($(objs[j]))
                        }
                    }
                    var allHerf1 = $(".docContainer .content, #docHead, #AutoGenerateSidebar, .sideBar, #crumbs").find("a");
                    for (var i = 0; i < allHerf1.length; i++) {
                        allHerf1[i].onclick = function () {
                            if (!$(this).hasClass("refreshLink") && $(this).parents(".sideBar").length > 0 && $("#articleContent").length > 0) {
                                addParam(this, verArray[0], 'sidebar', needh3);
                            } else if (!$(this).hasClass("refreshLink") && $(this).parents(".markdown-body").length > 0 && $("#articleContent").length > 0) {
                                addParam(this, verArray[0], 'docContainer', needh3);
                            } else if (!$(this).hasClass("refreshLink") && $(this).parents("#AutoGenerateSidebar").length > 0) {
                                addParam(this, verArray[0], 'rightMenuContainer', needh3);
                            } else if (!$(this).hasClass("refreshLink") && !$(this).hasClass("noVersionAdd")) {
                                addParam(this, verArray[0]);
                            } else {
                                return true
                            }
                            return false;
                        };
                    }

                    DisplayFullTreeAndArticle(generateDocHead, needh3, pageStartVer, verArray, needFilterLangTree, product, productVersion, curProduct)
                } else {
                    DisplayFullTreeAndArticle(generateDocHead, needh3, pageStartVer, verArray, needFilterLangTree, product, productVersion, curProduct)
                    OpenLanguageChooseModal()
                }
                // End Version Tree
            } else {
                count++
            }
        }, 100)
    }
}

function DisplayFullTreeAndArticle(generateDocHead, needh3, pageStartVer, verArray, needFilterLangTree, product, productVersion, curProduct) {
    var navWrap = document.getElementById("fullTreeMenuListContainer");
    if (navWrap != null) {
        HighlightCurrentListForFullTree("fullTreeMenuListContainer", true, document.URL, pageStartVer, verArray[1], needFilterLangTree);
        if (generateDocHead) {
            if (needh3 == 'true') {
                needh3 = true;
            } else if (needh3 == 'false') {
                needh3 = false;
            }
            if (needh3) {
                $('#fullTreeMenuListContainer').addClass('needh3');
            }
            GenerateContentByHead(needh3);
        }
        var hiddenLayout = $('.docContainer, .sideBar, .history');
        for (var i = 0; i < hiddenLayout.length; i++) {
            hiddenLayout[i].style.visibility = "visible";
        }
        initFoldPanel();
        init();

        // multi panel switching start
        let multiPanelListSwitchingItems = $(".multi-panel-switching-prefix")
        for (let i = 0; i < multiPanelListSwitchingItems.length; i++) {
            generateSwitchingItems($(multiPanelListSwitchingItems[i]), needh3)
            let multiPanelSwitchBtns = $(multiPanelListSwitchingItems[i]).find("+ul > li")
            let hash = location.hash
            let switchIndex = 0
            if (hash && hash != "") {
                for (let j = 0; j < multiPanelSwitchBtns.length; j++) {
                    if ($(multiPanelSwitchBtns[j]).find("a").attr("href") == hash) {
                        switchIndex = j
                    }
                }
            }
            $(multiPanelSwitchBtns[switchIndex]).addClass("on")
            let nextSiblings = $(multiPanelListSwitchingItems[i]).find("+ul ~")
            showSelectMultiPanel(nextSiblings, switchIndex, needh3)
        }
        // multi panel switching end

        $("article").on("click", ".multi-panel-switching-prefix + ul > li", function () {
            $(this).parent("ul").find("li").removeClass("on")
            $(this).addClass("on")
            let nextSiblings = $(this).parent("ul").nextAll()
            showSelectMultiPanel(nextSiblings, $(this).index(), needh3)
        })

        var treeHeight = $('#fullTreeMenuListContainer')[0].clientHeight;
        var treeOffsetTop = $('#fullTreeMenuListContainer').offset() ? $('#fullTreeMenuListContainer').offset().top : 0;
        var nodeOffsetTop = $('#fullTreeMenuListContainer .activeLink').length > 0 ? $('#fullTreeMenuListContainer .activeLink').offset().top : 0;
        var lineHeight = $('#fullTreeMenuListContainer .activeLink').length > 0 ? $('#fullTreeMenuListContainer .activeLink')[0].offsetHeight : 0;
        if (nodeOffsetTop > treeHeight + treeOffsetTop - lineHeight) {
            $('#fullTreeMenuListContainer').scrollTop(nodeOffsetTop - treeOffsetTop - lineHeight);
        }

        // if dcv docs but use in other docs, link did'nt find, go to index page
        if (product && productVersion && curProduct == 'dcv' && $('#fullTreeMenuListContainer .activeLink').length == 0) {
            var menuLis = $("#fullTreeMenuListContainer > li")
            for (var i = 0; i < menuLis.length; i++) {
                let aTag = $(menuLis[i]).find(" > a").eq(0).attr("href")
                if ($(menuLis[i]).is(":visible") && aTag) {
                    window.location.href = aTag + "?ver=" + productVersion;
                    return;
                }
            }
        }

        navWrap = document.getElementById("fullTreeMenuListContainer");
        var liAry = navWrap.getElementsByTagName("li");

        // 新模版不走这个逻辑，所以不需要绑定事件。
        // if ($("#categoryMenuTree").length == 0) {
        //     for (var i = 0, len = liAry.length; i < len; i++) {
        //         liAry[i].onclick = (function (i) {
        //             return function (event) {
        //                 if ($(liAry[i]).children("a").length == 0 || $(liAry[i]).children("a")[0].getAttribute("href") == null) {
        //                     var subUl = $(liAry[i]).children("ul");
        //                     if (subUl.length > 0) {
        //                         for (var j = 0; j < subUl.length; j++) {
        //                             if (subUl[j].style.display == "block") {
        //                                 var parentL = $(subUl[j]).parents("li");
        //                                 if (parentL.length > 0) {
        //                                     parentL[0].className = "collapseListStyle"
        //                                 }
        //                                 subUl[j].style.display = "none";
        //                             } else {
        //                                 subUl[j].style.display = "block";
        //                                 var parentL = $(subUl[j]).parents("li");
        //                                 if (parentL.length > 0) {
        //                                     parentL[0].className = "expandListStyle"
        //                                 }
        //                                 var parentUl = $(liAry[i]).parents("ul");
        //                                 for (var m = 0; m < parentUl.length; m++) {
        //                                     if (parentUl[m].style.display != "block") {
        //                                         var parentL = $(parentUl[m]).parents("li");
        //                                         if (parentL.length > 0) {
        //                                             parentL[0].className = "expandListStyle"
        //                                         }
        //                                         parentUl[m].style.display = "block";
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //                 event.stopPropagation();
        //             }
        //         })(i)
        //     }
        // }
    }
}

function HighlightCurrentListForFullTree(searchListId, firstTime, searchUrl = document.URL, pageStartVer = undefined, curPageRealVer = undefined, needFilterLangTree = false) {
    var navWrap = document.getElementById(searchListId);
    // console.log(navWrap)
    if (navWrap != null) {
        var listAry = navWrap.getElementsByTagName("li");
        var oriUrl = searchUrl;
        //history version doc url
        searchUrl = searchUrl.replace(/\/index-v[0-9]+[^\/]*.html/g, "/");
        searchUrl = searchUrl.replace(/-v[0-9]+[^\/]*\//g, "/");
        searchUrl = searchUrl.replace(/-v[0-9]+[^\/]*.html/g, ".html");

        var dochead = document.head || document.getElementsByTagName('head')[0];

        if (searchUrl != oriUrl) {
            oriUrl = searchUrl;
            if (oriUrl.indexOf("#") != -1) {
                oriUrl = oriUrl.substring(0, oriUrl.indexOf("#"));
            }
            if (oriUrl.indexOf("?") != -1) {
                oriUrl = oriUrl.substring(0, oriUrl.indexOf("?"));
            }
            var linkTag = document.createElement('link');
            linkTag.href = oriUrl;
            linkTag.rel = 'canonical';
            dochead.appendChild(linkTag);
        }

        //index url with content anchor
        if (searchUrl.indexOf("/#") != -1) {
            searchUrl = searchUrl.substring(0, searchUrl.indexOf("/#") + 1);
        }
        var bestMatchList = -1;
        var bestReturnVal = -1;

        FilterLangFullTree(needFilterLangTree)

        // console.log(listAry)
        for (var i = 0, len = listAry.length; i < len; i++) {
            var curLi = listAry[i];
            if (!$(curLi).attr("otherLang")) {
                var curListATag = $(curLi).children("a");
                if (curListATag.length > 0 && curListATag[0].getAttribute("href") != null && curListATag[0].getAttribute("href") != "#") {
                    var returnVal = UrlSearch(searchUrl, curListATag[0].href);
                    if (returnVal == 2) {
                        bestReturnVal = returnVal;
                        bestMatchList = i;
                        break;
                    } else {
                        if (returnVal > bestReturnVal || (returnVal == 0 && bestReturnVal == 0)) {
                            bestReturnVal = returnVal;
                            bestMatchList = i;
                        }

                        if (!firstTime) {
                            curListATag[0].style.fontWeight = 'normal';
                        }
                    }
                }
            }
        }

        if (bestMatchList != -1) {
            var curLi = listAry[bestMatchList];
            var curLiLevel = getCurrentMenuObjLevel(curLi)
            $(curLi).attr("data-level", curLiLevel);
            var curListATag = $(curLi).children("a");
            if (bestReturnVal == 0) {
                var ver = getUrlVars(document.URL)["ver"];
                var ifChangeVersion = getUrlVars(document.URL)["cVer"];
                if (ifChangeVersion != undefined || (ver != undefined &&
                        ((ver != "latest" && pageStartVer != undefined && pageStartVer != "" && pageStartVer > ver) ||
                            (curPageRealVer != undefined && curPageRealVer != "" && ((ver == "latest" && ver != curPageRealVer) || (ver != "latest" && ver > curPageRealVer)))
                        ))) {
                    addParam(curListATag[0], ver);
                }
            }

            if (document.URL.indexOf("web-twain/docs/faq/") < 0 || document.URL.indexOf("web-twain/docs/faq/?ver") > 0) {
                curListATag[0].className = "otherLinkColour activeLink"
            }

            if (firstTime) {
                if (curLiLevel > 5 || (curLiLevel == 5 && $(curLi).find("ul").length > 0)) {
                    var randomId = Math.random().toString(36).substring(2);
                    var needUL = findNearestLevel5(curLi, curLiLevel);
                    needUL = needUL && needUL.length > 0 ? needUL[0] : null;
                    if (needUL) {
                        $(needUL).attr("id", "child-" + randomId)
                        $(needUL).parent().attr("id", randomId)
                        $(needUL).prepend(`<li class="subsetBtnLine"><a data-randomId="${randomId}" class="refreshLink" href="javascript:;" onclick="onSubsetBtnLineClick('${randomId}')">......<span>Show parent</span></a></li>`)
                        var objs = $(needUL).parents("li")

                        for (var i = 0; i < objs.length; i++) {
                            if ($(objs[i]).parent().is("#fullTreeMenuListContainer")) {
                                $(objs[i]).attr("data-opensubset", "true")
                                $(objs[i]).find("> ul").addClass("hide_overlimit5")
                                $(objs[i]).append(needUL)
                            }
                        }
                    }
                }
                
                
                menuAddIcon(curLi)

                initCrumbs()
            }
        }
    }
}

function menuAddIcon(curLi) {
    var parentsUL = $(curLi).parents("ul");
    for (var j = 0, lenUL = parentsUL.length; j < lenUL; j++) {
        var curUL = parentsUL[j];
        if (curUL.style.display != "block") {
            curUL.style.display = "block";
        }
        var curULChildrenListAry = $(curUL).children("li");
        for (var k = 0, lenChildLi = curULChildrenListAry.length; k < lenChildLi; k++) {
            var curULTag = $(curULChildrenListAry[k]).children("ul");
            if (curULTag.length > 0) {
                if (curULTag[0].style.display != "block") {
                    curULChildrenListAry[k].className = "collapseListStyle"
                    var iconItem = document.createElement("i")
                    iconItem.className = "icon-arrow"
                    curULChildrenListAry[k].appendChild(iconItem)
                } else {
                    curULChildrenListAry[k].className = "expandListStyle"
                    var iconItem = document.createElement("i")
                    iconItem.className = "icon-arrow"
                    curULChildrenListAry[k].appendChild(iconItem)
                }
            }
        }
    }

    var childUL = $(curLi).children("ul");
    if (childUL.length > 0) {
        curLi.className = "expandListStyle"
        if (childUL[0].style.display != "block") {
            childUL[0].style.display = "block";
        }

        if ($("#categoryMenuTree").length == 0) {
            curListATag[0].removeAttribute("href");
        }

        var childrenLi = $(childUL[0]).children("li");
        for (var j = 0; j < childrenLi.length; j++) {
            var curULTag = $(childrenLi[j]).children("ul");
            if (curULTag.length > 0) {
                if (curULTag[0].style.display != "block") {
                    childrenLi[j].className = "collapseListStyle"
                    var iconItem = document.createElement("i")
                    iconItem.className = "icon-arrow"
                    childrenLi[j].appendChild(iconItem)
                } else {
                    childrenLi[j].className = "expandListStyle"
                    var iconItem = document.createElement("i")
                    iconItem.className = "icon-arrow"
                    childrenLi[j].appendChild(iconItem)
                }
            }
        }
    }
    var parentsLi = $(curLi).parents("li");
    for (var j = 0, lenLi = parentsLi.length; j < lenLi; j++) {
        parentsLi[j].className = "expandListStyle"
        var iconItem = document.createElement("i")
        iconItem.className = "icon-arrow"
        parentsLi[j].appendChild(iconItem)
    }
}

function findNearestVersion(ver) {
    var versionList = $(".fullVersionInfo li").not(".hideLi, .latestVer")
    var bestVer = ver,
        verDiff = null
    for (var i = 0; i < versionList.length; i++) {
        if (!$(versionList[i]).hasClass("hasChildLi")) {
            var tempVer = $(versionList[i]).text().toLowerCase()
            if (tempVer.indexOf("latest version") >= 0) {
                tempVer = "latest"
            } else {
                tempVer = tempVer.replace('version ', '');
            }
            if (tempVer == ver) {
                return tempVer
            } else {
                var tmpDiff = GetVersionDiff(ver, tempVer);
                if (verDiff == null || (tmpDiff >= 0 && (tmpDiff < verDiff || verDiff < 0))) {
                    verDiff = tmpDiff;
                    bestVer = tempVer;
                }
            }
        }
    }
    if (verDiff) {
        return bestVer
    } else {
        return "latest"
    }
}
// #endregion

// #region common function
function getUrlVars(inputUrl) {
    var vars = {};
    var parts = inputUrl.replace(/[?&]+([^=&]+)=([^&^#]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function UsefulRecord(isUseful) {
    var encodeUrl = encodeURIComponent(document.URL);
    if (isUseful) {
        $.get("https://www.dynamsoft.com/Secure/Rate.ashx?paper=" + encodeUrl + "&product=DBR-Doc&rate=5")
    } else {
        $.get("https://www.dynamsoft.com/Secure/Rate.ashx?paper=" + encodeUrl + "&product=DBR-Doc&rate=1")
    }

    var feedbackTag = document.getElementById("feedbackFooter");

    if (feedbackTag != null) {
        feedbackTag.innerHTML = "Thanks!";
    }
}

function getCurrentUrlRepoType(url) {
    var currentPath = url
    if (currentPath.includes(`${docsFolderName}server/`)) {
        return 'server'
    }
    if (currentPath.includes(`${docsFolderName}core/`)) {
        return 'core'
    }
    if (currentPath.includes(`${docsFolderName}mobile/`)) {
        return 'mobile'
    }
    if (currentPath.includes(`${docsFolderName}web/`)) {
        return 'web'
    }
}

function getCurrentUrlLang(url, needFilterLang = false) {
    if (getUrlVars(url)["lang"] || getUrlVars(url)["src"]) {
        var result = ""
        if (!getUrlVars(url)["lang"]) {
            result = getUrlVars(url)["src"]
        } else {
            result = getUrlVars(url)["lang"].toLowerCase().trim().split(",")[0]
        }
        if (result == "js") {
            result = "javascript"
        }
        if (result == "ios" || result == "objective-c" || result == "objc" || result == "swift") {
            result = "objectivec-swift"
        }
        if (result == "c++" || result == "cpp") {
            result = "cplusplus"
        }
        if (result == "c") {
            result = "c"
        }
        if (result == 'csharp') {
            result = "dotnet"
        }
        if (result == 'android-kotlin') {
            result = "android"
        }
        return result
    }
    let reporType = getCurrentUrlRepoType(url)
    if (reporType == "server" || reporType == "mobile" || needFilterLang) {
        if (url.indexOf("/c-cplusplus/") > 0) {
            if (getUrlVars(url)["src"]) {
                var src = getUrlVars(url)["src"].toLowerCase().trim()
                if (src == "c") {
                    return "c"
                } else if (src == "cplusplus" || src == "cpp") {
                    return "cplusplus"
                } else {
                    return "c"
                }
            } else {
                return "c"
            }
        } else {
            var arr = []
            if (reporType == "server" && url.split(`${docsFolderName}server/`).length > 1) {
                arr = url.split(`${docsFolderName}server/`)[1].split("/")
            }
            if (reporType == "mobile" && url.split(`${docsFolderName}mobile/`).length > 1) {
                arr = url.split(`${docsFolderName}mobile/`)[1].split("/")
            }
            if (reporType == "mobile" && ["objectivec-swift", "android", "android-kotlin", "xamarin", "react-native", "flutter", "cordova", "maui"].indexOf(arr[1]) < 0) {
                return "objectivec-swift"
            } else if (reporType == "web" || reporType == "js") {
                return "javascript"
            } else {
                return arr.length > 1 ? arr[1] : ''
            }
        }
    } else {
        return ""
    }
}

function generateSwitchingItems(multi_prefix, needh3) {
    if ($(multi_prefix).find("+ul").length > 0) {
        return 
    }
    var nextSiblings = $(multi_prefix).nextAll()
    var multi_titles = []
    for (let j = 0; j < nextSiblings.length; j++) {
        if ($(nextSiblings[j]).hasClass("multi-panel-switching-end")) {
            break;
        }
        if ($(nextSiblings[j]).hasClass("multi-panel-title")) {
            multi_titles.push(nextSiblings[j])
        }
    }

    var html = "<ul>"
    for (let i = 0; i < multi_titles.length; i++) {
        var title = $(multi_titles[i]).text()
        var titleHash = getMultiTitleHash(title)
        html += `
            <li>
                <a href="#${titleHash}">${title}</a>
            </li>
        `
    }
    html += "</ul>"

    $(multi_prefix).after(html)

    let rightMenuATags = $(multi_prefix).find("+ ul > li > a")
    for (let i = 0; i < rightMenuATags.length; i++) {
        rightMenuATags[i].onclick = function () {
            addParam(this, SearchVersion()[0], 'docContainer', needh3);
            return false;
        };
    }
}

function getMultiTitleHash(title) {
    return title.replaceAll(" ", "-").toLowerCase()
}

function showSelectMultiPanel(nextSiblings, findItemIndex, needh3) {
    let isFind = false,
        findItemCount = 0,
        aTags = [],
        isFindTag = false,
        findTagName = 'h2';
    for (let j = 0; j < nextSiblings.length; j++) {
        if ($(nextSiblings[j]).hasClass("multi-panel-switching-end")) {
            break;
        }
        if ($(nextSiblings[j]).hasClass("multi-panel-start")) {
            if (findItemCount == findItemIndex) {
                isFind = true
            }
            findItemCount++
        }
        if (isFind && $(nextSiblings[j]).hasClass("multi-panel-end")) {
            isFind = false
        }
        if (isFind) {
            if ($(nextSiblings[j]).is("table")) {
                let objs = $(nextSiblings[j]).find("a")
                for (let i = 0; i < objs.length; i++) {
                    let id = '#' + $(objs[i]).attr("href").split("#")[1]
                    aTags.push(id)
                }
            }
            $(nextSiblings[j]).show()
        } else {
            let id = nextSiblings[j].id
            if (aTags.includes('#' + id)) {
                findTagName = nextSiblings[j].tagName
                isFindTag = true
                $(nextSiblings[j]).show()
            } else if (isFindTag && !$(nextSiblings[j]).is(findTagName)) {
                $(nextSiblings[j]).show()
            } else {
                isFindTag = false
                $(nextSiblings[j]).hide()
            }
        }
    }
    GenerateContentByHead(needh3)
}

function getDoumentName(product) {
    switch (product) {
        case 'dwt':
            return 'web-twain';
        case 'dbr':
            return 'barcode-reader';
        case 'dlr':
            return 'label-recognition';
        case 'dce':
            return 'camera-enhancer';
        case 'dcp':
            return 'code-parser';
        case 'ddn':
            return 'document-normalizer';
        case 'dcv':
            return 'capture-vision';
        case 'mwc':
            return 'mobile-web-capture';
        case 'ddv':
            return 'document-viewer';
        case 'lts':
            return 'license-server';
        case 'mrz':
            return 'mrz-scanner';
        default:
            return '';
    }
}

function getCurrentUrlProductName(url = null) {
    url = url ? url.replace("https://", "") : null
    url = url ? url.replace("http://", "") : null
    var currentPath = url ? url.replace(url.split('/')[0], "") : document.location.pathname
    currentPath = currentPath.slice(1, currentPath.length)
    var productParam = currentPath.split('/')[0]
    switch (productParam) {
        case 'web-twain':
            return 'dwt';
        case 'barcode-reader':
            return 'dbr';
        case 'label-recognition':
            return 'dlr';
        case 'camera-enhancer':
            return 'dce';
        case 'code-parser':
            return 'dcp';
        case 'document-normalizer':
            return 'ddn';
        case 'capture-vision':
            return 'dcv';
        case 'mobile-web-capture':
            return 'mwc';
        case 'document-viewer':
            return 'ddv';
        case 'license-server':
            return 'lts';
        case 'mrz-scanner':
            return 'mrz';
        default:
            return '';
    }
}

function getRepoTypeByLang(lang, url) {
    var repoType = null
    if (lang && lang != "core") {
        lang = lang.toLowerCase().trim().split(",")[0]
        if (['javascript', 'js'].indexOf(lang) >= 0) {
            repoType = "web"
        }
        if (['android', 'android-kotlin', 'objective-c', 'objc', 'swift', 'ios', 'objectivec-swift', 'maui', 'react-native', 'reactNative', 'flutter', 'xamarin', 'cordova'].indexOf(lang) >= 0) {
            repoType = "mobile"
        }
        if (['c', 'cpp', 'c++', 'cplusplus', 'csharp', 'dotnet', 'java', 'python', 'nodejs'].indexOf(lang) >= 0) {
            repoType = "server"
        }
    } else {
        repoType = "core"
    }

    if (url && lang == "java") {
        if (url.indexOf(`${docsFolderName}mobile/`) >= 0) {
            repoType = "mobile"
        } else {
            repoType = "server"
        }
    }
    return repoType
}

function getDocumentationLink(product, lang, url) {
    var reporType = getRepoTypeByLang(lang, url)
    if (product == "dbr" && lang && lang != "core") {
        lang = lang == "js" ? "javascript" : lang
        lang = ['objective-c', 'objc', 'swift', 'ios'].indexOf(lang) >= 0 ? "objectivec-swift" : lang
        lang = ['cpp', 'c++'].indexOf(lang) >= 0 ? "cplusplus" : lang
        return "/" + getDoumentName(product) + docsFolderName + reporType + "/programming/" + lang + "/"
    } else {
        if (product == "dcv" && isArchiveDocsLink) {
            return "/" + getDoumentName(product) + '/docs-archive/' + reporType + "/introduction/"
        } else {
            return "/" + getDoumentName(product) + docsFolderName + reporType + "/introduction/"
        }
    }
}

function getDocumentationText(product, lang) {
    if ((product == "dbr" || product == "dcv") && lang && lang != "core") {
        lang = lang == "js" ? "javascript" : lang;
        lang = ['objective-c', 'objc', 'swift', 'ios'].indexOf(lang) >= 0 ? "iOS" : lang;
        lang = ['cpp', 'c++', 'cplusplus'].indexOf(lang) >= 0 ? "C++" : lang;
        lang = lang.charAt(0).toUpperCase() + lang.slice(1); // Capitalize the first letter
        lang = lang == "IOS" ? "iOS" : lang
        productName = product == "dbr" ? "Barcode Reader" : "Capture Vision";
        return `${productName} ${lang} Edition`;
    } else {
        return null
    }
}

function initCrumbs() {
    var crumbul = $('#crumbs').children("ul")
    if (crumbul.length != 0) {
        var product = getUrlVars(document.URL)["product"] || getCurrentUrlProductName(document.URL)
        if (getUrlVars(document.URL)["product"] || DcvProducts.indexOf(product) >= 0) {
            product = DcvProducts.indexOf(product) >= 0 ? "dcv" : product
            var documentationLink = getDocumentationLink(product, getCurrentUrlLang(document.URL, true), document.URL)
            var documentationText = getDocumentationText(product, getCurrentUrlLang(document.URL, true), document.URL)
            var menuLis = $("#fullTreeMenuListContainer > li")
            var flag = false
            for (var i = 0; i < menuLis.length; i++) {
                let aTag = $(menuLis[i]).find(" > a").eq(0).attr("href")
                if ($(menuLis[i]).is(":visible") && aTag && !flag) {
                    documentationLink = aTag
                    flag = true
                }
            }
            $(crumbul[0]).find("a").eq(0).attr("href", documentationLink)
            documentationText && $(crumbul[0]).find("a").eq(0).text(documentationText)
        }
        var appendText = "";
        var expandList = $("#fullTreeMenuListContainer .expandListStyle")
        for (var i = 0; i < expandList.length; i++) {
            if ($(expandList[i]).find(".activeLink").length > 0) {
                var atag = $(expandList[i]).find("> a")
                if ($(atag).hasClass("activeLink")) {
                    appendText += '<li id="breadcrumbLastNode">' + $(atag)[0].textContent + '</li>'
                } else {
                    if ($(atag)[0].href != "") {
                        appendText += '<li><a class="bluelink" href = "' + $(atag)[0].href + '">' + $(atag)[0].textContent + '</a></li>'
                    } else {
                        appendText += '<li>' + $(atag)[0].textContent + '</li>'
                    }
                }
            }
        }
        var activeLis = $("#fullTreeMenuListContainer a.activeLink")
        if (activeLis.length > 0 && !$(activeLis[0]).parent().hasClass("expandListStyle")) {
            appendText += '<li id="breadcrumbLastNode">' + $(activeLis[0]).text() + '</li>'
        }
        $(crumbul[0]).append(appendText);
    }
}

function UrlSearch(docUrl, listUrl) {
    docUrl = docUrl.toLowerCase();
    listUrl = listUrl.toLowerCase();

    docUrl = docUrl.replace(/\/index.html/g, "/");
    listUrl = listUrl.replace(/\/index.html/g, "/");

    var docUrlWithParam = getUrlVars(docUrl)["src"];
    var listUrlWithParam = getUrlVars(listUrl)["src"];

    if (docUrlWithParam != undefined && listUrlWithParam != undefined && docUrlWithParam != listUrlWithParam) {
        return -1;
    }

    var tmpExp = new RegExp('programming/c-cplusplus/$')
    if (tmpExp.exec(docUrl) != null) {
        docUrl = docUrl.substring(0, docUrl.indexOf("c-cplusplus/"));
    }

    var tmpExp = new RegExp('programming/c-cplusplus/$')
    if (tmpExp.exec(listUrl) != null) {
        listUrl = listUrl.substring(0, listUrl.indexOf("c-cplusplus/"));
    }

    var docUrlAnchor;
    var listUrlAnchor;

    if (docUrl.indexOf("#") != -1) {
        docUrlAnchor = docUrl.substring(docUrl.indexOf("#") + 1);
        docUrl = docUrl.substring(0, docUrl.indexOf("#"));
    }
    if (listUrl.indexOf("#") != -1) {
        listUrlAnchor = listUrl.substring(listUrl.indexOf("#") + 1);
        listUrl = listUrl.substring(0, listUrl.indexOf("#"));
    }

    if (docUrl.indexOf("?") != -1) {
        docUrl = docUrl.substring(0, docUrl.indexOf("?"));
    }
    if (listUrl.indexOf("?") != -1) {
        listUrl = listUrl.substring(0, listUrl.indexOf("?"));
    }

    var regExp = new RegExp('^' + listUrl + '$');
    if (regExp.exec(docUrl) != null) {
        if (docUrlAnchor == listUrlAnchor || docUrlAnchor == undefined) {
            if (docUrlWithParam == undefined && listUrlWithParam != undefined) {
                return 1;
            }
            return 2;
        } else if (docUrlAnchor != undefined && listUrlAnchor == undefined) {
            return 1;
        }
    } else {
        regExp = new RegExp('^' + listUrl);
        if (regExp.exec(docUrl) != null) {
            return 0;
        } else {
            return -1;
        }
    }
}

function SearchVersion(currentUrl = null) {
    var docUrl = currentUrl || document.URL;
    var ver = getUrlVars(docUrl)["ver"];
    var curVerFromUrl = "";
    var tmpExp = new RegExp(/-v[0-9]+[^\/^?^#]*((\/)|(.html))/g);
    var searchAry = tmpExp.exec(docUrl);
    if (searchAry != null) {
        curVerFromUrl = searchAry[0].replace('-v', '');
        curVerFromUrl = curVerFromUrl.replace('.html', '');
        curVerFromUrl = curVerFromUrl.replace('/', '');
    } else {
        curVerFromUrl = "latest"
    }

    var productName = getUrlVars(docUrl)["product"];

    var compatiableDiv = document.getElementById("compatibleInfo");
    if (ver == undefined) {
        ver = curVerFromUrl;
        if (compatiableDiv != null) {
            compatiableDiv.style.display = "none";
        }
    } else if (ver != curVerFromUrl) {
        var curVerTag = $(".currentVersion ");
        var compatibleTag = $(".compatibleCurVersion")
        if (curVerTag != null) {
            if (ver == "latest") {
                curVerTag[0].innerText = "latest version";
            } else {
                curVerTag[0].innerText = "version " + ver;
            }
            if (productName != undefined) {
                var productVersion = getUrlVars(docUrl)[productName];
                if (productVersion != undefined) {
                    if (productVersion == "latest") {
                        curVerTag[0].innerText = "latest version";
                    } else {
                        curVerTag[0].innerText = "version " + productVersion;
                    }
                }
            }
        }
        if (compatiableDiv != null && compatibleTag != null) {
            compatiableDiv.style.display = "block";
            compatibleTag[0].innerText = "Version " + ver;
            if (productName != undefined) {
                var productVersion = getUrlVars(docUrl)[productName];
                if (productVersion != undefined) {
                    if (productVersion == "latest") {
                        compatiableDiv.style.display = "none";
                    } else {
                        compatibleTag[0].innerText = "Version " + productVersion;
                    }
                }
            }
        } else if (compatiableDiv != null) {
            compatiableDiv.style.display = "none";
        }
    } else if (compatiableDiv != null) {
        compatiableDiv.style.display = "none";
    }
    if (productName != undefined) {
        var productVersion = getUrlVars(docUrl)[productName];
        if (productVersion != undefined) {
            ver = productVersion
        }
    }
    var verArray = new Array(ver, curVerFromUrl);
    return verArray;
}

async function getVersionSearchList(needArchive = false) {
    var product = getUrlVars(document.URL)["product"] || getCurrentUrlProductName(document.URL)
    var lang = getUrlVars(document.URL)["lang"] || getCurrentUrlLang(document.URL, true)
    var repoType = getRepoTypeByLang(lang, document.URL)
    product = DcvProducts.indexOf(product) >= 0 ? "dcv" : product
    if (product == "lts" || product == "" || product == "mwc" || product == "ddv" || product == "mrz") {
        return null
    }
    var docsStr = needArchive ? "docs-archive" : "docs"

    return new Promise((resolve) => {
        $.ajax({
            url: `${location.origin}/${getDoumentName(product)}/${docsStr}/${repoType}/assets/js/${product}${titleCase(repoType)}VersionSearch.json`,
            type: "get",
            dataType: 'json',
            success: function (data) {
                if (data) {
                    resolve(data)
                } else {
                    resolve(null)
                }
            },
            error: function () {
                resolve(null)
            }
        })
    }).then(async (data) => {
        if (data) {
            return data
        } else {
            return null
        }
    })
}

function isInIOSDos(curUrl, linkUrl) {
    var curProduct = getCurrentUrlProductName(curUrl)
    var linkProduct = getCurrentUrlProductName(linkUrl)
    if (curProduct != linkProduct) {
        return false
    } else {
        if (linkUrl.indexOf(`${docsFolderName}mobile/programming/objectivec-swift/`) > 0) {
            return true
        } else {
            return false
        }
    }
}

function getFormatVal(inputVer) {
    if (!inputVer || inputVer == "latest") {
        return 99999999
    }
    var arr = inputVer.split(".")
    var sum = 0
    if (arr.length == 1) {
        arr.push(0)
    }
    if (arr.length == 2) {
        arr.push(0)
    }
    for (var i = 0; i < arr.length; i++) {
        var num = Number(arr[i])
        if (i == 2) {
            // num = num < 100 ? num * 100 : num
            sum = sum * 10000 + num
        } else {
            sum = sum * 100 + num
        }
    }
    return sum
}

function GetVersionDiff(inputVer, compareVer) {
    if (compareVer == "latest") {
        return 99999999;
    }

    return getFormatVal(compareVer) - getFormatVal(inputVer)
}

function titleCase(s) {
    var i, ss = s && s != "" ? s.toLowerCase().split(/\s+/) : "";
    for (i = 0; i < ss.length; i++) {
        ss[i] = ss[i].slice(0, 1).toUpperCase() + ss[i].slice(1);
    }
    return ss && ss.length > 0 ? ss.join(' ') : "";
}

function getProductLangLatestVersion(product, lang) {
    lang = lang == "react-native" ? "reactNative" : lang
    product = DcvProducts.indexOf(product) >= 0 ? "dcv" : product
    var productMatch = docsLangLatestVersion[product]
    var langVersion = productMatch ? productMatch[lang] : null
    return langVersion
}

// 2025/06/25 add first archive version for dbr/dcv/mrz...
function getProductLangFirstArchiveVersion(product, lang=null) {
    return docsFirstArchiveVersion[product];
    // lang = lang == "react-native" ? "reactNative" : lang
    // product = DcvProducts.indexOf(product) >= 0 ? "dcv" : product
    // var productMatch = docsFirstArchiveVersion[product]
    // var langVersion = productMatch ? (lang ? productMatch[lang] : null) : null
    // return langVersion
}

function showPageContentInModal(fetchUrl) {
    fetch(fetchUrl).then(function (response) {
        return response.text()
    }).then(function (data) {
        if ($(data).find("#articleContent .markdown-body").length > 0) {
            var articleContentHtml = $(data).find("#articleContent .markdown-body").html()
            var modalHtml = `
                <div class="docsModal" id="docsModal">
                    <div class="article">
                        <div class="title fontOswald">
                            <i class="fr" onclick="closeDocsModal()"><svg viewBox="64 64 896 896" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class=""><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg></i>
                        </div>
                        <div class="content markdown-body">${articleContentHtml}</div>
                    </div>
                </div>
            `
            $("body").append(modalHtml)

            // load sample-code style
            if ($("#docsModal .markdown-body .sample-code-prefix").length > 0 && getUrlVars(fetchUrl)["lang"]) {
                var langs = getUrlVars(fetchUrl)["lang"].toLowerCase().trim().split(",")
                if (langs) {
                    if (langs.length == 1) {
                        sampleCodeSingleLangInit(langs[0], null, null, true)
                    } else {
                        sampleCodeLangsInit(langs, true)
                    }
                }
            } else if ($("#docsModal .markdown-body .sample-code-prefix").length > 0) {
                $('.markdown-body .sample-code-prefix + blockquote > ul > li:first-child').addClass('on')
                $('.markdown-body .sample-code-prefix + blockquote > ol > li:first-child').addClass('on')
                var template2Objs = $('#docsModal .markdown-body .sample-code-prefix.template2 + blockquote')
                for (var i = 0; i < template2Objs.length; i++) {
                    $(template2Objs[i]).find(">div").eq(0).addClass('on')
                }
            }
        } else {
            window.location.href = fetchUrl
        }
    }).catch(function (e) {
        window.location.href = fetchUrl
    })
}

function closeDocsModal() {
    $("#docsModal").remove()
}

function loadActiveTagMenu(aTag) {
    let ulTag = $(aTag).parent().parent("ul")
    $(aTag).parent("li").addClass("hasActiveLinkList")
    if (ulTag.length > 0) {
        $(ulTag[0]).show()
        let childLis = $(ulTag[0]).find(">li")
        for (let i = 0; i < childLis.length; i++) {
            if ($(childLis[i]).find(">ul").length > 0) {
                if ($(childLis[i]).find("> i.icon-arrow").length <= 0) {
                    var iconItem = document.createElement("i")
                    iconItem.className = "icon-arrow"
                    childLis[i].appendChild(iconItem)
                }
                if ($(childLis[i]).hasClass("hasActiveLinkList")) {
                    $(childLis[i]).addClass("expandListStyle").removeClass("collapseListStyle")
                    $(childLis[i]).find(">ul").show()
                } else {
                    $(childLis[i]).addClass("collapseListStyle")
                }
            }
        }
        if ($(ulTag[0]).parent().parent().attr("id") != "fullTreeMenuListContainer") {
            loadActiveTagMenu($(ulTag[0]).parent().find(">a"))
        } else {
            $(ulTag[0]).parent().addClass("expandListStyle").addClass("hasActiveLinkList").removeClass("collapseListStyle")
        }
    }
}

function OpenLanguageChooseModal() {
    var originUrl = document.URL
    var redirectUrl = location.pathname
    var anchorStr = location.hash
    var queryStr = location.search

    var languageModalHtml = `
        <div class="languageChooseModal">
            <div class="content">
                <p class="note">Please choose a language: </p>
                <ul class="editionList">
                <li>
                    Web (Client Side):
                    <ul>
                        <li>
                            <img src="https://www.dynamsoft.com/capture-vision/docs/core/assets/img-icon/homepage/js.svg" alt="Web Icon" class="js">
                            <a href="${redirectUrl}${queryStr}${queryStr !="" ? "&" : "?"}lang=javascript${anchorStr}">Web</a>
                        </li>
                    </ul>
                </li>
                <li>
                    Mobile:
                    <ul>
                        <li>
                            <img src="https://www.dynamsoft.com/capture-vision/docs/core/assets/img-icon/homepage/Android.svg" alt="Android Icon" class="android">
                            <a href="${redirectUrl}${queryStr}${queryStr !="" ? "&" : "?"}lang=android${anchorStr}">Android</a>
                        </li>
                        <li>
                            <img src="https://www.dynamsoft.com/capture-vision/docs/core/assets/img-icon/homepage/iOS.svg" alt="iOS Icon" class="ios">
                            <a href="${redirectUrl}${queryStr}${queryStr !="" ? "&" : "?"}lang=objectivec-swift${anchorStr}">iOS</a>
                        </li>
                        <li>
                            <img src="https://www.dynamsoft.com/capture-vision/docs/core/assets/img-icon/homepage/MAUI.svg" alt="MAUI Icon" class="maui">
                            <a href="${redirectUrl}${queryStr}${queryStr !="" ? "&" : "?"}lang=maui${anchorStr}">MAUI</a>
                        </li>
                    </ul>
                </li>
                <li>
                    Server / Desktop:
                    <ul>
                        <li>
                            <img src="https://www.dynamsoft.com/capture-vision/docs/core/assets/img-icon/homepage/Python.svg" alt="Python Icon" class="python">
                            <a href="${redirectUrl}${queryStr}${queryStr !="" ? "&" : "?"}lang=python${anchorStr}">Python</a>
                        </li>
                        <li>
                            <img src="https://www.dynamsoft.com/capture-vision/docs/core/assets/img-icon/homepage/dotnet.svg" alt=".NET Icon" class="dotnet">
                            <a href="${redirectUrl}${queryStr}${queryStr !="" ? "&" : "?"}lang=dotnet${anchorStr}">.NET</a>
                        </li>
                        <li>
                            <img src="https://www.dynamsoft.com/capture-vision/docs/core/assets/img-icon/homepage/cplusplus.svg" alt="C++ Icon" class="cplusplus">
                            <a href="${redirectUrl}${queryStr}${queryStr !="" ? "&" : "?"}lang=cplusplus${anchorStr}">C++</a>
                        </li>
                    </ul>
                </li>
                </ul>
            </div>
        </div>
    `

    $("body").append(languageModalHtml)
}
// #endregion

function getCurrentMenuObjLevel(obj) {
    let level = 0;
    let currentElement = obj;

    if ($(currentElement).is("li")) {
        level = 1;
    }

    while ($(currentElement).length && !$(currentElement).is("#fullTreeMenuListContainer")) {
        currentElement = $(currentElement).parent();
        if ($(currentElement).is("li")) {
            level++;
        }
    }

    return level;
}

function findNearestLevel5(obj, level) {
    let currentElement = obj;
    while (level % 5 != 0) {
        currentElement = $(currentElement).parent();
        if ($(currentElement).is("li")) {
            level --
        }
    }
    return $(currentElement).parent();
}

function onSubsetBtnLineClick(randomId, fromJS) {
    var childItems = $(`#child-${randomId}`)
    var parentItem = $(`#${randomId}`)
    $(childItems).siblings(".hide_overlimit5").removeClass("hide_overlimit5")
    $(childItems).find(".subsetBtnLine").remove()
    $(`#${randomId}`).append(childItems)
    menuAddIcon(parentItem)
    $(childItems).find("li").removeClass("expandListStyle").addClass("collapseListStyle")
    $(parentItem).removeClass("expandListStyle").addClass("collapseListStyle")
    if (childItems[0].style.display == "block") {
        childItems[0].style.display = "none";
    }
    if (!fromJS) {
        $(`#${randomId} > a`).trigger("click")
    }
    $(`#child-${randomId}`).removeAttr("id")
    $(`#${randomId}`).removeAttr("id")
}