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
    $("#articleContent").hide()
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
            if($(aTag).parents("li.collapseListStyle").length > 0) {
                $(aTag).parents("li.collapseListStyle").addClass("expandListStyle").removeClass("collapseListStyle")
                $(aTag).parents("li.expandListStyle").find(" > ul").slideDown()
            }
            $("#fullTreeMenuListContainer .activeLink").removeClass("activeLink")
            $(aTag).addClass("activeLink")
            $("#articleContent").html($(data).find("#articleContent").html()).show()
            $("#loadingContent").hide()

            if ($("#AutoGenerateSidebar").length > 0) {
                GenerateContentByHead(needh3);
                $('#crumbs > ul').html($('#crumbs > ul > li').eq(0))
                initCrumbs()
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
                }
            }
        }
    })
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
    // console.log("versionList: " + versionList)
    for (var i=0; i<versionList.length; i++) {
        var tempVer = $(versionList[i]).text().toLowerCase()
        if (tempVer == "latest version"){
            tempVer = "latest"
        } else{
            tempVer = tempVer.replace('version ','');
        }
        // console.log("tempVer: " + tempVer)
        if (tempVer == ver) {
            return tempVer
        } else {
            var tmpDiff = GetVersionDiff(ver, tempVer);
            if (verDiff == null || (tmpDiff >= 0 && (tmpDiff < verDiff || verDiff < 0))){
                verDiff = tmpDiff;
                bestVer = tempVer;
            }
            // console.log('tmpDiff: ' + tmpDiff)
            // console.log('verDiff: ' + verDiff)
            // console.log('bestVersion: ' + bestVer)
        }
    }
    if (verDiff) {return bestVer} else {return "latest"}
}
