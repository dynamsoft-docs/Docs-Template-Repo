function GenerateContentByHead(needh3 = true) {
    var titleList, appendHtml='<ul>';
    if (needh3) {
        titleList = document.querySelectorAll('.content h2, .content h3');
    } else {
        titleList = document.querySelectorAll('.content h2');
    }
    for(var i = 0; i < titleList.length; i++) {
        var curH2Text = $(titleList[i]).text();
        var curH2Href =  $(titleList[i]).attr("id");
        var curliContent = '<li style="list-style-image: none; list-style-type: circle;"><a href="#' + curH2Href + '" class="otherLinkColour">' + curH2Text + '</a>';
        if (i + 1 < titleList.length && titleList[i].localName == 'h2' && titleList[i+1].localName == 'h3') {
            curliContent += '<ul name="listLevel2">';
            for (var j = i+1; j < titleList.length; j++) {
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
        $('#AutoGenerateSidebar').append(appendHtml);
        if ($("#AutoGenerateSidebar > ul > li").length == 0) {
            $(".rightSideMenu > p").hide()
        } else {
            $(".rightSideMenu > p").show()
        }
    }
}

function FullTreeMenuList(generateDocHead, needh3 = true, pageStartVer = undefined, useVersionTree = false) {
    // check if /docs/core && lang exist, update iframe src
    var pageUrl = document.URL;
    var needFilterLangTree = false;
    
    if (useVersionTree == 'true') {
        useVersionTree = true;
    }
    else if (useVersionTree == 'false') {
        useVersionTree = false;
    }
    if (generateDocHead == 'true') {
        generateDocHead = true;
    }
    else if (generateDocHead == 'false') {
        generateDocHead = false;
    }
    var verArray = SearchVersion();
    if (!useVersionTree) {
        var allHerf1 = $(".docContainer .content, #docHead, #AutoGenerateSidebar, .sideBar, #crumbs").find("a");
        for (var i = 0; i < allHerf1.length; i++)
        {
            allHerf1[i].onclick = function(){
                if (!$(this).hasClass("refreshLink") && $(this).parents(".sideBar").length > 0 && $("#articleContent").length > 0) {
                  addParam(this, verArray[0], 'sidebar', needh3); 
                } else if (!$(this).hasClass("refreshLink") && $(this).parents(".markdown-body").length > 0 && $("#articleContent").length > 0) {
                    addParam(this, verArray[0], 'docContainer', needh3); 
                } else {
                  addParam(this, verArray[0]); 
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
                }
                else if (needh3 == 'false') {
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
                                            // parentL[0].style.listStyleImage = "url('/assets/img-icon/collapse-list.png')";
                                        }
                                        subUl[j].style.display = "none";
                                    }
                                    else {
                                        subUl[j].style.display = "block";
                                        var parentL = $(subUl[j]).parents("li");
                                        if (parentL.length > 0) {
                                            parentL[0].className = "expandListStyle"
                                            // parentL[0].style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                                        }
                                        var parentUl = $(liAry[i]).parents("ul");
                                        for (var m = 0; m < parentUl.length; m++) {
                                            if (parentUl[m].style.display != "block") {
                                                var parentL = $(parentUl[m]).parents("li");
                                                if (parentL.length > 0) {
                                                    parentL[0].className = "expandListStyle"
                                                    // parentL[0].style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                                                }
                                                parentUl[m].style.display = "block";
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            //HighlightCurrentListForFullTree("fullTreeMenuListContainer", false, ($(liAry[i]).children("a"))[0].href);
                        }
                        event.stopPropagation();
                    }
                })(i)
            }
        }
    }
    else {
        if (pageUrl.indexOf("/docs/core/") > 0 && getUrlVars(pageUrl)["lang"]) {
            var sideBarIframeSrc = getSideBarIframeSrc(pageUrl, getUrlVars(pageUrl)["lang"])
            if (sideBarIframeSrc) {
                $("#sideBarIframe").attr('src', sideBarIframeSrc)
                needFilterLangTree = true
            } 
        }
        if (getUrlVars(pageUrl)["product"] || getUrlVars(pageUrl)["repoType"]) {
            var sideBarIframeSrc = getSideBarIframeSrc(pageUrl, null, getUrlVars(pageUrl)["product"], getUrlVars(pageUrl)["repoType"])
            if (sideBarIframeSrc) {
                $("#sideBarIframe").attr('src', sideBarIframeSrc)
                needFilterLangTree = true
            }
        }
        var versionListInterval = setInterval(function() {
            var completeTag = $('#sideBarIframe').contents().find('#complete_loading_tree');
            if (completeTag && completeTag.length > 0) {
                clearInterval(versionListInterval);

                // Start Nav change
                // if page is dcv but used in ddn or other docs, need to change navbar
                // the nav bar in the (DDN or other docs's) Hide_Tree_Page.html file
                if (getUrlVars(pageUrl)["product"]) {
                    var navBar = $('#sideBarIframe').contents().find('#docsNavBar');
                    if (navBar && navBar.length > 0) {
                        $(".productMenu").parent().html($(navBar[0]).html())
                        if (getCurrentUrlProductName() == "dcv") {
                            var historyVersion = $('#sideBarIframe').contents().find('.fullVersionHistory');
                            $("#categoryMenuTree_history .fullVersionHistory").html($(historyVersion[0]).html());
                            var product = getUrlVars(pageUrl)["product"]
                            var productVersion = getUrlVars(pageUrl)[product]
                            if(productVersion != undefined) {
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
                // console.log(version_tree_list, curPageVersion);
                version_tree_list = $('#sideBarIframe').contents().find('#version_tree_list ul.version-tree-container');
                // console.log(version_tree_list, curPageVersion);
                if (version_tree_list && version_tree_list.length > 0  && curPageVersion) {
                    for(var i = 0; i<version_tree_list.length; i++) {
                        // console.log($(version_tree_list[i]).attr('id'), 'version_tree_' + curPageVersion);
                        if ($(version_tree_list[i]).attr('id') == 'version_tree_' + curPageVersion) {
                            $('#fullTreeMenuListContainer').html($(version_tree_list[i]).html());
                        }
                    }
                    var allHerf1 = $(".docContainer .content, #docHead, #AutoGenerateSidebar, .sideBar, #crumbs").find("a");
                    for (var i = 0; i < allHerf1.length; i++)
                    {
                        allHerf1[i].onclick = function(){
                            if (!$(this).hasClass("refreshLink") && $(this).parents(".sideBar").length > 0 && $("#articleContent").length > 0) {
                              addParam(this, verArray[0], 'sidebar', needh3); 
                            } else if (!$(this).hasClass("refreshLink") && $(this).parents(".markdown-body").length > 0 && $("#articleContent").length > 0) {
                                addParam(this, verArray[0], 'docContainer', needh3); 
                            } else {
                              addParam(this, verArray[0]); 
                            }
                            return false;
                        };
                    }
        
                    var navWrap = document.getElementById("fullTreeMenuListContainer");
                    // console.log("navWrap: " + navWrap)
                    if (navWrap != null) {
                        HighlightCurrentListForFullTree("fullTreeMenuListContainer", true, document.URL, pageStartVer, verArray[1], needFilterLangTree);
                        if (generateDocHead) {
                            if (needh3 == 'true') {
                                needh3 = true;
                            }
                            else if (needh3 == 'false') {
                                needh3 = false;
                            }
                            if (needh3) {
                                $('#fullTreeMenuListContainer').addClass('needh3');
                            }  
                            GenerateContentByHead(needh3);
                            //GenerateContentByHead(false);
                        }
                        var hiddenLayout = $('.docContainer, .sideBar, .history');
                        // console.log("hiddenLayout: " + hiddenLayout)
                        for (var i = 0; i < hiddenLayout.length; i++) {
                            hiddenLayout[i].style.visibility = "visible";
                        }
                        initFoldPanel();
                        init();

                        var treeHeight = $('#fullTreeMenuListContainer')[0].clientHeight;
                        var treeOffsetTop = $('#fullTreeMenuListContainer').offset() ? $('#fullTreeMenuListContainer').offset().top : 0;
                        var nodeOffsetTop = $('#fullTreeMenuListContainer .activeLink').length > 0 ? $('#fullTreeMenuListContainer .activeLink').offset().top : 0;
                        var lineHeight = $('#fullTreeMenuListContainer .activeLink').length > 0 ? $('#fullTreeMenuListContainer .activeLink')[0].offsetHeight : 0;
                        if (nodeOffsetTop > treeHeight + treeOffsetTop - lineHeight) {
                            $('#fullTreeMenuListContainer').scrollTop(nodeOffsetTop - treeOffsetTop - lineHeight);
                        }
    
                        navWrap = document.getElementById("fullTreeMenuListContainer");
                        var liAry = navWrap.getElementsByTagName("li");
                        
                        if ($("#categoryMenuTree").length == 0) {
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
                                                            // parentL[0].style.listStyleImage = "url('/assets/img-icon/collapse-list.png')";
                                                        }
                                                        subUl[j].style.display = "none";
                                                    }
                                                    else {
                                                        subUl[j].style.display = "block";
                                                        var parentL = $(subUl[j]).parents("li");
                                                        if (parentL.length > 0) {
                                                            parentL[0].className = "expandListStyle"
                                                            // parentL[0].style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                                                        }
                                                        var parentUl = $(liAry[i]).parents("ul");
                                                        for (var m = 0; m < parentUl.length; m++) {
                                                            if (parentUl[m].style.display != "block") {
                                                                var parentL = $(parentUl[m]).parents("li");
                                                                if (parentL.length > 0) {
                                                                    parentL[0].className = "expandListStyle"
                                                                    // parentL[0].style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                                                                }
                                                                parentUl[m].style.display = "block";
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            //HighlightCurrentListForFullTree("fullTreeMenuListContainer", false, ($(liAry[i]).children("a"))[0].href);
                                        }
                                        event.stopPropagation();
                                    }
                                })(i)
                            }
                        }
                    }
                }
                // End Version Tree
            }
            
        }, 100)
    }
}

function SearchVersion() {
    var docUrl = document.URL;    
    var ver = getUrlVars(docUrl)["ver"];
    var curVerFromUrl = "";
    var tmpExp = new RegExp(/-v[0-9]+[^\/^?^#]*((\/)|(.html))/g);
    var searchAry = tmpExp.exec(docUrl);
    if (searchAry != null){
        curVerFromUrl = searchAry[0].replace('-v','');
        curVerFromUrl = curVerFromUrl.replace('.html','');
        curVerFromUrl = curVerFromUrl.replace('/', '');
    }
    else{
        curVerFromUrl = "latest"
    }

    var compatiableDiv = document.getElementById( "compatibleInfo");
    if (ver == undefined){
        ver = curVerFromUrl;
        if(compatiableDiv != null){
            compatiableDiv.style.display = "none";
        }
    }
    else if (ver != curVerFromUrl){
        var curVerTag = $(".currentVersion ");
        var compatibleTag = $(".compatibleCurVersion")
        if (curVerTag != null) {
            if (ver == "latest"){
                curVerTag[0].innerText = "latest version";
            }
            else{
                curVerTag[0].innerText = "version "+ver;
            }
        }
        if(compatiableDiv != null){
            
        }
        if (compatiableDiv != null && compatibleTag != null){
            compatiableDiv.style.display = "block";
            compatibleTag[0].innerText = "Version "+ver;
        }
        else if (compatiableDiv != null){
            compatiableDiv.style.display = "none";
        }
    }
    else if (compatiableDiv != null){
        compatiableDiv.style.display = "none";
    }

    var verArray = new Array(ver, curVerFromUrl);
    return verArray;
}

function HighlightCurrentListForFullTree(searchListId, firstTime, searchUrl = document.URL, pageStartVer = undefined, curPageRealVer = undefined, needFilterLangTree=false) {
    var navWrap = document.getElementById(searchListId);
    // console.log(navWrap)
    if (navWrap != null) {
        var listAry = navWrap.getElementsByTagName("li");        
        var oriUrl = searchUrl;
        //history version doc url
        searchUrl = searchUrl.replace(/\/index-v[0-9]+[^\/]*.html/g,"/");
        searchUrl = searchUrl.replace(/-v[0-9]+[^\/]*\//g,"/");
        searchUrl = searchUrl.replace(/-v[0-9]+[^\/]*.html/g,".html");

        var dochead = document.head || document.getElementsByTagName('head')[0];

        if (searchUrl != oriUrl){
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
            searchUrl = searchUrl.substring(0, searchUrl.indexOf("/#") + 1 );
        }
        var bestMatchList = -1;
        var bestReturnVal = -1;

        FilterLangFullTree(needFilterLangTree)

        // console.log(listAry)
        for (var i = 0, len = listAry.length; i < len; i++) {
            var curLi = listAry[i];
            if (!$(curLi).attr("otherLang")) {
                var curListATag =  $(curLi).children("a");
                if (curListATag.length > 0 && curListATag[0].getAttribute("href") != null && curListATag[0].getAttribute("href") != "#") {
                    var returnVal = UrlSearch(searchUrl, curListATag[0].href);
                    if (returnVal == 2) {
                        bestReturnVal = returnVal;
                        bestMatchList = i;
                        break;               
                    }
                    else {
                        if (returnVal > bestReturnVal || ( returnVal == 0 && bestReturnVal == 0)) {
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
            var curListATag =  $(curLi).children("a");
            if (bestReturnVal == 0) {
                var ver = getUrlVars(document.URL)["ver"];
                var ifChangeVersion = getUrlVars(document.URL)["cVer"];
                if (ifChangeVersion != undefined || (ver != undefined &&
                    ((ver != "latest" && pageStartVer != undefined && pageStartVer != "" && pageStartVer > ver) 
                    || (curPageRealVer != undefined && curPageRealVer != "" && ((ver == "latest" && ver != curPageRealVer) || (ver != "latest" && ver > curPageRealVer)))
                    ))) {
                    addParam(curListATag[0], ver);
                }
            }
            
            if (document.URL.indexOf("web-twain/docs/faq/") < 0 || document.URL.indexOf("web-twain/docs/faq/?ver") > 0) {
                curListATag[0].className = "otherLinkColour activeLink"
            }

            if (firstTime) {
                var parentsUL = $(curLi).parents("ul");
                for (var j = 0, lenUL = parentsUL.length; j < lenUL; j++) {
                    var curUL =  parentsUL[j];
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
                            }
                            else {
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
                            }
                            else {
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

                initCrumbs()
            }
        }
    }
}

function UrlSearch(docUrl, listUrl) {
    docUrl = docUrl.toLowerCase();
    listUrl = listUrl.toLowerCase();

    docUrl = docUrl.replace(/\/index.html/g,"/");
    listUrl = listUrl.replace(/\/index.html/g,"/");

    var docUrlWithParam = getUrlVars(docUrl)["src"];
    var listUrlWithParam = getUrlVars(listUrl)["src"];
    
    if (docUrlWithParam != undefined && listUrlWithParam != undefined && docUrlWithParam != listUrlWithParam) {
        return -1;
    }

    var tmpExp = new RegExp('programming/c-cplusplus/$')
    if (tmpExp.exec(docUrl) != null) {
        docUrl = docUrl.substring(0, docUrl.indexOf("c-cplusplus/"));
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
        }
        else if (docUrlAnchor != undefined && listUrlAnchor == undefined) {
            return 1;
        }
    }
    else {
        regExp = new RegExp('^' + listUrl);
        if (regExp.exec(docUrl) != null) {
            return 0;
        }
        else {
            return -1;
        }
    }
}

function getUrlVars(inputUrl) {
    var vars = {};
    var parts = inputUrl.replace(/[?&]+([^=&]+)=([^&^#]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function UsefulRecord(isUseful) {
    var encodeUrl = encodeURIComponent(document.URL);
    if (isUseful) {
        $.get("https://www.dynamsoft.com/Secure/Rate.ashx?paper="+encodeUrl+"&product=DBR-Doc&rate=5")
    }
    else {
        $.get("https://www.dynamsoft.com/Secure/Rate.ashx?paper="+encodeUrl+"&product=DBR-Doc&rate=1")
    }
    
    var feedbackTag = document.getElementById("feedbackFooter");

    if(feedbackTag!=null) {
        feedbackTag.innerHTML = "Thanks!";
    }
}

function initCrumbs() {
    var crumbul = $('#crumbs').children("ul")
    if (crumbul.length != 0) {
        var appendText = "";
        var expandList = $("#fullTreeMenuListContainer .expandListStyle")
        for (var i=0; i<expandList.length; i++) {
            if ($(expandList[i]).find(".activeLink").length > 0) {
                var atag = $(expandList[i]).find("> a")
                if ($(atag).hasClass("activeLink")) {
                    appendText += '<li id="breadcrumbLastNode">' + $(atag)[0].textContent + '</li>'
                } else {
                    appendText += '<li><a class="bluelink" href = "' + $(atag)[0].href + '">'+ $(atag)[0].textContent + '</a></li>'
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

function FilterLangFullTree(needFilterLang=false) {
    // console.log("-------------- Start Filter Lang Full Tree --------------")
    // console.log(needFilterLang)
    var curUrl = document.URL
    if (curUrl.indexOf("/docs/server/") > 0 || curUrl.indexOf("/docs/mobile/") > 0 || needFilterLang) {
        var lang = getCurrentUrlLang(curUrl, needFilterLang);
        // console.log(lang)
        var fullTreeLis = $("#fullTreeMenuListContainer > li")
        for(var i=0;i<fullTreeLis.length;i++) {
            var liItemLang = fullTreeLis[i].getAttribute("lang")
            if (liItemLang&&liItemLang!=""&&liItemLang.toLowerCase()!=lang) {
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

function getCurrentUrlLang(url, needFilterLang=false, repoType=null) {
    if (url.indexOf("/docs/server/") > 0 || url.indexOf("/docs/mobile/") > 0 || needFilterLang) {
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
        } else if (getUrlVars(url)["lang"] || getUrlVars(url)["src"]) {
            var result = ""
            if (!getUrlVars(url)["lang"]) {
                result = getUrlVars(url)["src"]
            } else {
                result = getUrlVars(url)["lang"].toLowerCase().trim().split(",")[0]
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
            if(result == 'csharp') {
                result = "dotnet"
            }
            return result
        } else {
            var arr = url.indexOf("/docs/server/") > 0 ? url.split("/docs/server/")[1].split("/") : (url.indexOf("/docs/mobile/") > 0 ? url.split("/docs/mobile/")[1].split("/"): '')
            if (url.indexOf("/docs/mobile/") > 0 && ["objectivec-swift", "android", "xamarin", "react-native", "flutter", "cordova"].indexOf(arr[1]) < 0) {
                return "objectivec-swift"
            } else {
                return arr[1]
            }
        }
    } else {
        return ""
    }
}

function getDoumentName(product) {
    switch (product) {
        case 'dwt': return 'web-twain';
        case 'dbr': return 'barcode-reader';
        case 'dlr': return 'label-recognition';
        case 'dce': return 'camera-enhancer';
        case 'dcp': return 'code-parser';
        case 'ddn': return 'document-normalizer';
        case 'dcv': return 'capture-vision'
        default: return '';
    }
}

function getSideBarIframeSrc(pageUrl, lang, product=null, repoType=null) {
    if (lang) {
        lang = lang.toLowerCase().trim().split(",")[0]
        if (['javascript', 'js'].indexOf(lang) >= 0) {
            return '/barcode-reader/docs/web/Hide_Tree_Page.html'
        }
        if (['android', 'objective-c', 'objc', 'swift'].indexOf(lang) >= 0) {
            return '/barcode-reader/docs/mobile/Hide_Tree_Page.html'
        }
        if (['c', 'cpp', 'c++', 'csharp', 'dotnet', 'java', 'python'].indexOf(lang) >= 0) {
            return '/barcode-reader/docs/server/Hide_Tree_Page.html'
        }
    } else {
        if (getDoumentName(product)) {
            repoType = repoType == null ? 'core' : repoType
            return '/'+ getDoumentName(product) +'/docs/'+ repoType +'/Hide_Tree_Page.html'
        }
    }
    return null
}