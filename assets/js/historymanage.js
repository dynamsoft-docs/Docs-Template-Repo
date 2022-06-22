function UrlReplace()
{
    var docUrl = document.URL;
    var ver = getUrlVars(docUrl)["ver"];
    var matchVer = getUrlVars(docUrl)["matchVer"];
    if (ver != undefined && ver != "latest") {
        var tempVer = findNearestVersion(ver);
        if (tempVer != ver) {
            var replaceUrl = docUrl.replace(ver, tempVer)
            window.location.replace(replaceUrl);
        }
    }
    if (matchVer == undefined && ver != undefined) {
        RedirToGivenVersionPage(ver);
    }
    if (ver == undefined) {
        if(docUrl.indexOf("?") > 0) {
            window.location.replace(docUrl + "&&ver=latest");
        } else {
            window.location.replace(docUrl + "?ver=latest");
        }
    }
}

function allHerfClick(_this, ver) {
    addParam(_this, ver);
    return false;
}

function RedirToGivenVersionPage(inputVer)
{
    var curVerTag = $(".currentVersion ");
    var bestVerIndex = -1;
    var verDiff = -1;
    var curVer = null;
    var bestVersion = null;
    if (curVerTag != null) {
        var verText = (curVerTag[0].innerHTML).toLowerCase();
        if (verText == "latest version"){
            curVer = "latest"
        }
        else{
            curVer = verText.replace('version ','');
        }
        if (curVer == inputVer){
            return;
        }
        else {
            bestVerIndex = -1;
            verDiff = GetVersionDiff(inputVer, curVer);
            bestVersion = curVer;
        }
    }
    var anchorVal = "";
    var curDocUrl = document.URL;
    if (curDocUrl.indexOf("#") != -1){
		var urlAry = curDocUrl.split("#");
		if (urlAry.length == 2){
            anchorVal = "#" + urlAry[1];
		}
	}

    var changeVer = "";
    var ifChangeVersion = getUrlVars(document.URL)["cVer"];
    if (ifChangeVersion != undefined) {
        changeVer = "&&cVer=true";
    }

    var historyList = $(".otherVersions");
    if (historyList != null)
    {
        var listAry = historyList[0].getElementsByTagName("li");

        for (var i = 0; i < listAry.length; i++) {
            var tmpVerText = listAry[i].innerText;
            var tmpVer = null;
            if (tmpVerText == "latest version"){
                tmpVer = "latest"
            }
            else{
                tmpVer = tmpVerText.replace('version ','');
            }
            if (tmpVer == inputVer){
                var aTag = $(listAry[i]).children("a");
                if (aTag.length > 0) {
                    var exp = new RegExp(/[?]+([^=]+)=/gi)
                    if (exp.exec(aTag[0].href) != null){
                        window.location.replace(aTag[0].href + "&&ver=" +inputVer+"&&matchVer=true" + changeVer + anchorVal);
                        return;
                    }
                    else{
                    	if (getUrlVars(document.URL)["src"] != undefined){
                    		window.location.replace(aTag[0].href + "?src=" + getUrlVars(document.URL)["src"] + "&&ver=" +inputVer+"&&matchVer=true" + changeVer + anchorVal);
                    	}
                    	else{
                        	window.location.replace(aTag[0].href + "?ver=" +inputVer+"&&matchVer=true" + changeVer + anchorVal);
                    	}
                       return;
                    }
                }
            }
            else {
                var tmpDiff = GetVersionDiff(inputVer, tmpVer);
                if (tmpDiff >= 0 && (tmpDiff < verDiff || verDiff < 0)){
                    bestVerIndex = i;
                    verDiff = tmpDiff;
                    bestVersion = tmpVer;
                }
            }
        }
    }
 
    
    if (bestVerIndex >= 0){
        var aTag = $(listAry[bestVerIndex]).children("a");
        if (aTag.length > 0) {
            var exp = new RegExp(/[?]+([^=]+)=/gi)
            if (exp.exec(aTag[0].href) != null){
                window.location.replace(aTag[0].href + "&&ver=" +inputVer+"&&matchVer=true"+ changeVer + anchorVal);
                return;
            }
            else{
                if (getUrlVars(document.URL)["src"] != undefined){
                    window.location.replace(aTag[0].href + "?src="+ getUrlVars(document.URL)["src"] + "&&ver=" +inputVer+"&&matchVer=true"+ changeVer + anchorVal);
                }
                else{
                    window.location.replace(aTag[0].href + "?ver=" +inputVer+"&&matchVer=true"+ changeVer + anchorVal);
                }
                return;
            }
        }
    }

    return;
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

function addParam (aTag, verText, fromSourse=null, needh3=false)
{
    var hrefVal = aTag.href;
    var changeHref = hrefVal

    if(hrefVal == "")
        return;

    var exp = new RegExp(/[?&]ver=[^&^#]+/gi);
	if (exp.exec(hrefVal) != null) {
        changeHref = hrefVal
	} else {
        var verStr = "";
        exp = new RegExp(/[?]+([^=]+)=/gi);
        verStr = exp.exec(hrefVal) != null ? ("&&ver=" + verText) : ("?ver=" + verText)
        if (hrefVal.indexOf("#") != -1) {
            var urlAry = hrefVal.split("#");
            if (urlAry.length == 2){
                changeHref = urlAry[0]+verStr+"#"+urlAry[1]
            }
        }
        else{
            changeHref = hrefVal+verStr
        }
    }
    // && (verText == "latest" || verText == undefined)
	if (fromSourse == "sidebar") {
        // request link
        if (!$(aTag).hasClass("activeLink")) {
            RequestNewPage(aTag, changeHref, needh3)
        }
    } else if (fromSourse == "docContainer") {
        if (aTag.target == '_blank') {
            window.open(changeHref);
        } else {
            console.log(aTag, changeHref, needh3)
            findCurLinkOnFullTree(aTag, changeHref, needh3)
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

function RequestNewPage(aTag, paramLink, needh3=false, redirectUrl = null) {
    $("#articleContent").addClass("hidden")
    $("#loadingContent").show()
    var fetchUrl = redirectUrl ? redirectUrl : aTag.href
    fetch(fetchUrl).then(function(response) {
        return response.text()
    }).then(function(data) {
        var inputVer = getUrlVars(paramLink)["ver"]
        var otherVersions = $(data).find(".otherVersions > li")

        if (inputVer == "latest" || inputVer == undefined || otherVersions.length == 0 || redirectUrl) {
            document.title = $(data)[1].innerText
            history.replaceState(null, null, paramLink)

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
            // show article content
            $("#articleContent").html($(data).find("#articleContent").html()).removeClass("hidden")
            $("#loadingContent").hide()
            // if full tree has scroll bar, scroll to activelink position
            var scrollDiv = document.getElementsByClassName("mainPage")[0]
            if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
                var activeLinkOffsetTop = $(".activeLink").offset().top - $(".mainPage").offset().top
                if (activeLinkOffsetTop - scrollDiv.scrollTop + 40 > scrollDiv.clientHeight) {
                    scrollDiv.scrollTop = activeLinkOffsetTop - 200
                }
            }
            // add addParam click function for all a tags in article content
            var articleContentATags = $("#articleContent").find("a")
            var verArray = SearchVersion();
            for (var i = 0; i < articleContentATags.length; i++)
            {
                articleContentATags[i].onclick = function(){
                    addParam(this, verArray[0], 'docContainer', needh3); 
                    return false;
                };
            }
            // load breadcrumbs add right side menu
            if ($("#AutoGenerateSidebar").length > 0) {
                GenerateContentByHead(needh3);
                $('#crumbs > ul').html($('#crumbs > ul > li').eq(0))
                initCrumbs()
            }
            // scroll to the start of article
            var sd = $(window).scrollTop()
            if (sd > 0) {
                window.scrollTo(0, sd > $('#overall-header').height() ? $('#overall-header').height() : sd)
            }
            // load sample-code style
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
            // load MathJax style
            if ($("#articleContent").find("script").length>0) {
                window.MathJax = null
                window.MathJax = {
                    tex: {
                        inlineMath: [['$', '$'], ['\\(', '\\)']],
                    },
                    chtml:{
                        scale: 1
                    }
                };
                
                (function () {
                    var script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
                    script.async = true;
                    document.head.appendChild(script);
                })();
            }

            // file tree
            if ($(".filetree h3").length > 0) {
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
            }
        } else {
            var bestVerIndex = -1;
            var verDiff = -1;
            var bestVersion = inputVer;
            
            var historyList = $(data).find(".otherVersions");
            var redirectTag = aTag
            var matchSuccess = false
            if (historyList != null) {
                var listAry = historyList[0].getElementsByTagName("li");
                for (var i = 0; i < listAry.length; i++) {
                    var tmpVerText = listAry[i].innerText;
                    var tmpVer = null;
                    if (tmpVerText == "latest version"){
                        tmpVer = "latest"
                    }
                    else{
                        tmpVer = tmpVerText.replace('version ','');
                    }
                    if (tmpVer == inputVer) {
                        var curTag = $(listAry[i]).children("a");
                        redirectTag = curTag[0]
                        if (paramLink.indexOf("?") > 0) {
                            paramLink = redirectTag.href + "?" + paramLink.split("?")[1]
                        } else if (paramLink.indexOf("#") > 0) {
                            paramLink = redirectTag.href + "#" + paramLink.split("#")[1]
                        }
                        matchSuccess = true
                        RequestNewPage(aTag, paramLink, needh3, redirectTag.href)
                        return
                    } else {
                        var tmpDiff = GetVersionDiff(inputVer, tmpVer);
                        if (tmpDiff >= 0 && (tmpDiff < verDiff || verDiff < 0)){
                            bestVerIndex = i;
                            verDiff = tmpDiff;
                            bestVersion = tmpVer;
                        }
                    }
                }
                
                if (bestVerIndex >= 0 && !matchSuccess){
                    var curTag = $(listAry[bestVerIndex]).children("a");
                    redirectTag = curTag[0]
                    if (paramLink.indexOf("?") > 0) {
                        paramLink = redirectTag.href + "?" + paramLink.split("?")[1]
                    } else if (paramLink.indexOf("#") > 0) {
                        paramLink = redirectTag.href + "#" + paramLink.split("#")[1]
                    }
                    RequestNewPage(aTag, paramLink, needh3, redirectTag.href)
                    return
                } else if (!matchSuccess) {
                    RequestNewPage(aTag, paramLink, needh3, aTag.href)
                    return
                }
            }
        }
    })
}

function findCurLinkOnFullTree(aTag, paramLink, needh3=false) {
    var fullTreeATags = $("#fullTreeMenuListContainer").find("a")
    var targetHref = aTag.href.toLowerCase()
    var curDocUrl = document.URL.toLowerCase()
    targetHref = targetHref.indexOf("?") > 0 ? targetHref.split("?")[0] : (targetHref.indexOf("#") > 0 ? targetHref.split("#")[0] : targetHref) 
    curDocUrl = curDocUrl.indexOf("?") > 0 ? curDocUrl.split("?")[0] : (curDocUrl.indexOf("#") > 0 ? curDocUrl.split("#")[0] : curDocUrl)
    if (curDocUrl == targetHref && aTag.href.split("#").length > 1) {
        var hash = aTag.href.split("#")[1]
        var sd = $(window).scrollTop()
        if (sd > 0) {
            window.scrollTo(0, $("#" + hash).offset().top)
        }
        history.replaceState(null, null, paramLink)
    } else {
        var flag = false
        for(var i=0; i<fullTreeATags.length; i++) {
            if(fullTreeATags[i].href && fullTreeATags[i].href.toLowerCase() == targetHref) {
                flag = true
                RequestNewPage(fullTreeATags[i], paramLink, needh3)
            }
        }
    
        if (!flag) {
            window.location.href = paramLink;
        }
    }
}

function changeVersion (liTag)
{
	var innertext = (liTag.innerText).toLowerCase();
	var ver = null;
	if (innertext == "latest version"){
		ver = "latest"
	}
	else{
		ver = innertext.replace('version ','');
	}
	var curUrl = document.URL;
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
	window.location.href = curUrl;
	return;
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
