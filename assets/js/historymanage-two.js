function UrlReplace()
{
    var docUrl = document.URL;
    var ver = getUrlVars(docUrl)["ver"];
    var matchVer = getUrlVars(docUrl)["matchVer"];
    var verFileName = "/v17.2.1/"
    if (ver != undefined && ver != "latest") {
        var tempVer = findNearestVersion(ver);
        if (tempVer!="latest" && tempVer != ver) {
            var replaceUrl = docUrl.replace(ver, tempVer)
            if (replaceUrl.indexOf("/docs/") >0) {
                replaceUrl = replaceUrl.replace("/docs/", "/docs-archive" + verFileName)
                window.location.replace(replaceUrl);
            }
        }
    }
    if (matchVer == undefined && ver != undefined && ver != "latest") {
        if (docUrl.indexOf("/docs/") >0) {
            docUrl = docUrl.replace("/docs/", "/docs-archive" + verFileName)
            window.location.replace(docUrl);
        }
    }
}

function allHerfClick(_this, ver) {
    addParam(_this);
    return false;
}

function GetVersionDiff(inputVer, compareVer)
{
    if (compareVer == "latest"){
        return 100;
    }

    if (compareVer < inputVer){
        return -1;
    }

    var inputChar = inputVer.split('.');
    var compareChar = compareVer.split('.');
    var diff = 0;

    var maxLength = Math.max(inputChar.length, compareChar.length);

    var curWeight = 1;
    for (var i = 0; i < maxLength; i++){
        var tmpInput = i < inputChar.length ? inputChar[i] : 0;
        if (isNaN(tmpInput)){
            diff = diff + curWeight;
            break;
        }
        var tmpCompare = i < compareChar.length ? compareChar[i] : 0;
        if (isNaN(tmpCompare)){
            diff = diff + curWeight;
            break;
        }
        var tmpDiff = tmpCompare - tmpInput;
        if (tmpDiff >= 0){
            curWeight = curWeight / 10;
            diff = diff + curWeight * tmpDiff;
        }
        else{
            diff = diff - curWeight;
            curWeight = curWeight / 10;
            diff = diff + curWeight * (tmpDiff + 10);
        }
    }
    
    return diff;
}

function addParam (aTag, fromSourse=null, needh3=false)
{
    if ($(aTag).hasClass('fullUrl')) {
        window.location.href = aTag.href;
        return
    }
    var hrefVal = aTag.href;
    var changeHref = hrefVal

    if(hrefVal == "")
        return;

    if (fromSourse == "sidebar") {
        var currentDocDomain = document.URL.split("/docs/")[0] + '/docs/';
        if (aTag.href.indexOf(currentDocDomain) < 0) {
            window.location.href = aTag.href;
            return;
        }
        // request link   || aTag.href.indexOf("/faq/") > 0
        if (!$(aTag).hasClass("activeLink")) {
            RequestNewPage(aTag, changeHref)
        }
    } else if (fromSourse == "docContainer") {
        if (aTag.target == '_blank') {
            window.open(changeHref);
        } else {
            findCurLinkOnFullTree(aTag, changeHref)
        }
    } else {
        if (aTag.target == '_blank') {
            window.open(changeHref);
        } else {
            window.location.href = changeHref;
        }
    }
	return;
}

function RequestNewPage(aTag, paramLink, onlyLoadContent=false) {
    $("#articleContent").addClass("hidden")
    $("#loadingContent").show()
    fetch(aTag.href).then(function(response) {
        return response.text()
    }).then(function(data) {
        document.title = $(data)[1].innerText;
        !onlyLoadContent&&history.pushState(null, null, paramLink);

        // remove old active link and li style
        for(var i=0; i < $("#fullTreeMenuListContainer .activeLink").parents("li").length;i++) {
            var obj = $("#fullTreeMenuListContainer .activeLink").parents("li")[i]
            if ($(obj).hasClass("hasActiveLinkList")) {
                $(obj).removeClass("hasActiveLinkList")
            }
        }

        $("#fullTreeMenuListContainer .activeLink").removeClass("activeLink")
        // add current active link and li style
        $(aTag).addClass("activeLink")
        if($(aTag).parents("li.collapseListStyle").length > 0) {
            $(aTag).parents("li.collapseListStyle").addClass("expandListStyle").removeClass("collapseListStyle")
            $(aTag).parents("li.expandListStyle").find(" > ul").slideDown()
        }
        $(aTag).parents("li.expandListStyle").addClass("hasActiveLinkList")
        // $("#articleContent").html($(data).find("#articleContent").html()).removeClass("hidden")
        
        // show article content
        var showRightSideMenu = $("#articleContent").hasClass("showRightSideMenu")
        $("#articleContent").html($(data).find("#articleContent").html()).removeClass("hidden")
        if (!showRightSideMenu) {
            $("#articleContent").find(".rightSideMenu, .markdown-body").removeClass("showRightSideMenu")
        }
        $("#loadingContent").hide()
        needh3 =  $(data).find("#articleContent").data("needh3") == true ? true : false
        // if full tree has scroll bar, scroll to activelink position
        var scrollDiv = document.getElementsByClassName("mainPage")[0]
        if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
            var activeLinkOffsetTop = $(".activeLink").offset().top - $(".mainPage").offset().top
            if (activeLinkOffsetTop - scrollDiv.scrollTop + 40 > scrollDiv.clientHeight) {
                scrollDiv.scrollTop = activeLinkOffsetTop - 200
            }
        }

        //  noTitleIndex
        if ($(".headCounter").hasClass("noTitleIndex")) {
            $("#AutoGenerateSidebar").addClass("noTitleIndex")
        } else {
            $("#AutoGenerateSidebar").removeClass("noTitleIndex")
        }

        // replace edit url link
        var editMdFileLink = $(data).find("#docHead").find(".iconsBox a")[0].href
        $("#docHead .iconsBox a").attr("href", editMdFileLink)

        // add addParam click function for all a tags in article content
        var articleContentATags = $("#articleContent").find("a")
        for (var i = 0; i < articleContentATags.length; i++)
        {
            articleContentATags[i].onclick = function(){
                addParam(this, 'docContainer'); 
                return false;
            };
        }

        if ($("#AutoGenerateSidebar").length > 0) {
            GenerateContentByHead(false);
        }
        
        $('#crumbs > ul').html($('#crumbs > ul > li').eq(0))
        initCrumbs()

        var preList = $('.markdown-body .highlight pre')
        for (var i=0; i<preList.length; i++) {
            var iconItem = document.createElement("i")
            iconItem.className = "copyIcon fa fa-copy"
            preList[i].appendChild(iconItem)
        }

        // scroll to the start of article
        var hash = paramLink.split("#").length > 1 ? paramLink.split("#")[1].toLowerCase() : null
        var sd = $(window).scrollTop()
        if (hash && $("#" + hash).length > 0) {
            window.scrollTo(0, $("#" + hash).offset().top)
        } else {
            if (sd > 0) {
                window.scrollTo(0, sd > $('#overall-header').height() ? $('#overall-header').height() : sd)
            }
        }
    
        if($(".markdown-body .sample-code-prefix").length > 0 && getUrlVars(document.URL)["lang"]) {
            var langs = getUrlVars(document.URL)["lang"].toLowerCase().trim().split(",")
            if (langs) {
                if (langs.length == 1) {
                    sampleCodeSingleLangInit(langs[0])
                } else {
                    sampleCodeLangsInit(langs)
                }
            }
        } else if ($(".markdown-body .sample-code-prefix").length > 0) {
            $('.markdown-body .sample-code-prefix + blockquote > ul > li:first-child').addClass('on')
            $('.markdown-body .sample-code-prefix + blockquote > ol > li:first-child').addClass('on')
            var template2Objs = $('.markdown-body .sample-code-prefix.template2 + blockquote')
            for (var i=0; i<template2Objs.length; i++) {
                $(template2Objs[i]).find(">div").eq(0).addClass('on')
            }
        }

        anchors.add();
    })
}

function findCurLinkOnFullTree(aTag, paramLink, onlyLoadContent=false) {
    var fullTreeATags = $("#fullTreeMenuListContainer").find("a")
    var targetHref = aTag.href.toLowerCase()
    var curDocUrl = document.URL.toLowerCase()
    targetHref = targetHref.indexOf("?") > 0 ? targetHref.split("?")[0] : (targetHref.indexOf("#") > 0 ? targetHref.split("#")[0] : targetHref) 
    curDocUrl = curDocUrl.indexOf("?") > 0 ? curDocUrl.split("?")[0] : (curDocUrl.indexOf("#") > 0 ? curDocUrl.split("#")[0] : curDocUrl)
    
    if (curDocUrl == targetHref && (aTag.href.split("#").length > 1 || document.URL.split("#").length > 1)) {
        var hash = aTag.href.split("#").length > 1 ? aTag.href.split("#")[1].toLowerCase() : null
        window.scrollTo(0, hash && $("#" + hash).length > 0 ? $("#" + hash).offset().top : 0)
        !onlyLoadContent&&history.pushState(null, null, paramLink)
    } else {
        var flag = false
        for(var i=0; i<fullTreeATags.length; i++) {
            var searchHref = fullTreeATags[i].href
            searchHref = searchHref.indexOf("index.html") > 0 ? searchHref.replace("index.html", "") : searchHref
            targetHref = targetHref.indexOf("index.html") > 0 ? targetHref.replace("index.html", "") : targetHref
            searchHref = searchHref.indexOf("?") > 0 ? searchHref.split("?")[0] : (searchHref.indexOf("#") > 0 ? searchHref.split("#")[0] : searchHref) 
            if (searchHref && searchHref.toLowerCase() == targetHref) {
                flag = true
                RequestNewPage(fullTreeATags[i], paramLink, onlyLoadContent)
            }
        }
    
        if (!flag) {
            window.location.href = paramLink;
        }
    }
}

function changeVersion (liTag) {
	var innertext = (liTag.innerText).toLowerCase();
	var ver = null;
	if (innertext.indexOf("latest version")>=0){
		ver = "latest"
	}
	else{
		ver = innertext.replace('version ','');
	}
	var curUrl = document.URL;
    var verFileName = "/v" + ver + "/";
    if (curUrl.indexOf("web-twain/docs-archive/v18.1/") > 0 && GetVersionDiff('17.2.1', ver) < 0) {
        verFileName = '/v17.2.1/';
    }
    
	var srcVal = getUrlVars(curUrl)["src"];
	var anchorVar = undefined;
	if (curUrl.indexOf("#") != -1){
		anchorVar = (curUrl.split("#")).pop();
	}

	if (curUrl.indexOf("?") != -1){
		curUrl = curUrl.substring(0, curUrl.indexOf("?"));
	}
	if (curUrl.indexOf("#") != -1){
		curUrl = curUrl.substring(0, curUrl.indexOf("#"));
	}
	
	curUrl = curUrl + "?ver=" + ver + "&&cVer=true";
	if (srcVal != undefined){
		curUrl = curUrl + "&&src=" + srcVal;
	}
	if(anchorVar != undefined){
		curUrl = curUrl + "#" + anchorVar;
	}
	if (curUrl.indexOf("web-twain/docs-archive/v18.1/") > 0 && ver == "latest") {
        curUrl = curUrl.replace("/docs-archive/v18.1/", "/docs/")
        window.location.href = curUrl
        return
    } else {
        curUrl = curUrl.replace("/docs-archive/v18.1/", "/docs-archive" + verFileName)
        window.location.href = curUrl;
	    return;
    }
}

function findNearestVersion(ver) {
    var versionList = $(".fullVersionInfo li")
    var bestVer = ver, verDiff=null
    for (var i=0; i<versionList.length; i++) {
        var tempVer = $(versionList[i]).text().toLowerCase()
        if (tempVer == "latest version"){
            tempVer = "latest"
        } else{
            tempVer = tempVer.replace('version ','');
        }
        if (tempVer == ver) {
            return tempVer
        } else {
            var tmpDiff = GetVersionDiff(ver, tempVer);
            if (verDiff == null || (tmpDiff >= 0 && (tmpDiff < verDiff || verDiff < 0))){
                verDiff = tmpDiff;
                bestVer = tempVer;
            }
        }
    }
    if (verDiff) {return bestVer} else {return "latest"}
}


window.addEventListener("popstate", function(e) {
    findCurLinkOnFullTree(location, location.href, true)
}, false)
