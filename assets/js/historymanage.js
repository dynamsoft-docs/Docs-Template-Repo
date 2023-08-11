function UrlReplace()
{
    initHistoryVersionList()
    var docUrl = document.URL;
    var ver = getUrlVars(docUrl)["ver"];
    var matchVer = getUrlVars(docUrl)["matchVer"];
    if (ver != undefined && ver != "latest") {
        var tempVer = findNearestVersion(ver);
        // console.log(tempVer)
        if (tempVer != ver) {
            var replaceUrl = docUrl.replace(ver, tempVer)
            window.location.replace(replaceUrl);
        }
    }
    if (matchVer == undefined && ver != undefined) {
        // console.log(123)
        RedirToGivenVersionPage(ver);
    }
    if (ver == undefined) {
        if (docUrl.indexOf("-v") > 0 && (docUrl.indexOf("-v") < docUrl.indexOf("?") || docUrl.indexOf("?") < 0)) {
            var docVer = docUrl.split("-v")[1]
            if (parseInt(docVer[0]) <= 9 && parseInt(docVer[0]) >= 0 && docVer.indexOf('.html') > 0) {
                docVer = docVer.split(".html")[0]
                if (docUrl.indexOf("?") < 0) {
                    window.location.replace(docUrl + "?ver=" + docVer);
                } else {
                    window.location.replace(docUrl + "&ver=" + docVer);
                }
            }
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
            anchorVal = "#" + urlAry[1].toLowerCase();
		}
	}

    var changeVer = "";
    var ifChangeVersion = getUrlVars(document.URL)["cVer"];
    if (ifChangeVersion != undefined) {
        changeVer = "&&cVer=true";
    }

    var productVar = ""
    var productParam = getUrlVars(document.URL)["product"];
    var repoTypeParam = getUrlVars(document.URL)["repoType"];
    

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
                        if (productParam != undefined && getCurrentUrlProductName() == "dcv") {
                            if (aTag[0].href > 0) {
                                productVar = "&&product=" + productParam + "&&repoType="+repoTypeParam;
                            } else {
                                productVar = "?product=" + productParam + "&&repoType="+repoTypeParam;
                            }
                            if (getUrlVars(document.URL)[productParam] != undefined) {
                                productVar += ("&&"+productParam + "=" + getUrlVars(document.URL)[productParam])
                            }
                        }
                        if (inputVer == 'latest') {
                            window.location.replace(aTag[0].href + productVar + anchorVal);
                        } else {
                            window.location.replace(aTag[0].href + "&&ver=" +inputVer+"&&matchVer=true" + productVar + changeVer + anchorVal);
                        }
                        return;
                    }
                    else{
                        var srcVal = getUrlVars(document.URL)["src"]
                        var langVal = getUrlVars(document.URL)["lang"]
                        var redirectUrl = aTag[0].href
                    	if (srcVal != undefined){
                            redirectUrl = redirectUrl + '?src=' + srcVal
                    	}
                        if (langVal != undefined) {
                            redirectUrl = srcVal != undefined ? (redirectUrl + '&lang=' + langVal) : (redirectUrl + '?lang=' + langVal)
                        }
                        if (productParam != undefined && getCurrentUrlProductName() == "dcv") {
                            if (redirectUrl.indexOf("?") > 0) {
                                productVar = "&&product=" + productParam + "&&repoType="+repoTypeParam;
                            } else {
                                productVar = "?product=" + productParam + "&&repoType="+repoTypeParam;
                            }
                            if (getUrlVars(document.URL)[productParam] != undefined) {
                                productVar += ("&&"+productParam + "=" + getUrlVars(document.URL)[productParam])
                            }
                            redirectUrl = redirectUrl + productVar
                        }
                        if (inputVer == 'latest') {
                            window.location.replace(redirectUrl + anchorVal)
                        } else {
                            if (redirectUrl.indexOf("?") > 0) {
                                window.location.replace(redirectUrl + "&ver=" +inputVer+"&&matchVer=true" + changeVer + anchorVal)
                            } else {
                                window.location.replace(redirectUrl + "?ver=" +inputVer+"&&matchVer=true" + changeVer + anchorVal);
                            }
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
                var srcVal = getUrlVars(document.URL)["src"]
                var langVar = getUrlVars(document.URL)["lang"]
                var redirectUrl = aTag[0].href
                if (srcVal != undefined){
                    redirectUrl = redirectUrl + "?src="+ srcVal
                }
                if (langVar != undefined) {
                    redirectUrl = srcVal != undefined ? (redirectUrl + "&lang="+ langVal) : (redirectUrl + "?lang="+ langVal)
                }
                if (productParam != undefined && getCurrentUrlProductName() == "dcv") {
                    productVar = "&&product=" + productParam + "&&repoType="+repoTypeParam;
                    if (getUrlVars(document.URL)[productParam] != undefined) {
                        productVar += ("&&"+productParam + "=" + getUrlVars(document.URL)[productParam])
                    }
                }
                if(redirectUrl.indexOf("?") > 0) {
                    window.location.replace(redirectUrl + "&&ver=" +inputVer+"&&matchVer=true"+ productVar + changeVer + anchorVal);
                } else {
                    window.location.replace(redirectUrl + "?ver=" +inputVer+"&&matchVer=true"+ productVar + changeVer + anchorVal);
                }
                return;
            }
        }
    }

    if (inputVer == "latest") {
        var srcVal = getUrlVars(curDocUrl)["src"]
        var langVar = getUrlVars(curDocUrl)["lang"]
        var redirectUrl = curDocUrl.indexOf("?") > 0 ? curDocUrl.split("?")[0] : curDocUrl
        if (srcVal != undefined) {
            redirectUrl = redirectUrl + '?src='+ srcVal
        }

        if (langVal != undefined) {
            redirectUrl = srcVal != undefined ? (redirectUrl + '&lang=' + langVal) : (redirectUrl + '?lang=' + langVal)
        }

        if (productParam != undefined && getCurrentUrlProductName() == "dcv") {
            if (redirectUrl.indexOf("?") > 0) {
                productVar = "&&product=" + productParam + "&&repoType="+repoTypeParam;
            } else {
                productVar = "?product=" + productParam + "&&repoType="+repoTypeParam;
            }
            if (getUrlVars(document.URL)[productParam] != undefined) {
                productVar += ("&&"+productParam + "=" + getUrlVars(document.URL)[productParam])
            }
            redirectUrl = redirectUrl + productVar
        }

        window.location.replace(redirectUrl + anchorVal);
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
    var changeHref = hrefVal;
    var productName = getCurrentUrlProductName()
    var repoType = getUrlVars(document.URL)["repoType"] || getCurrentUrlRepoType(document.URL)
    var currentDocDomain = document.URL.split("/docs/")[0] + '/docs/';

    if(hrefVal == "")
        return;

    // mobile - ios 页面 - swift&objc 语言切换
    var urlLang = getUrlVars(hrefVal)["lang"]
    if ($(".languageWrap.multiProgrammingLanguage").length > 0 && getCurrentUrlLang(hrefVal, true) == "objectivec-swift") {
        var curLang = $(".languageWrap .languageSelectDown > div.on").data("value")
        if (urlLang) {
            hrefVal = hrefVal.replace('lang=' + urlLang, 'lang=' + curLang)
        } else {
            if (hrefVal.indexOf("?")>0){
                let tempHref = hrefVal.split("?")
                hrefVal = tempHref[0] + '?lang=' + curLang + '&' + tempHref[1]
            } else if (hrefVal.indexOf("#") > 0) {
                let tempHref = hrefVal.split("#")
                hrefVal = tempHref[0] + '?lang=' + curLang + '#' + tempHref[1]
            } else {
                hrefVal = hrefVal + '?lang=' + curLang
            }
        }
    }
    var exp = new RegExp(/[?&]ver=[^&^#]+/gi);
	if (exp.exec(hrefVal) != null) {
        var productVar = ""
        // different docs, different repo
        if (hrefVal.indexOf(currentDocDomain) < 0 && hrefVal.indexOf(document.location.host) >= 0 && hrefVal.indexOf("/docs/") > 0 && !getUrlVars(document.URL)["product"]) {
            productVar = 'product=' + productName + '&repoType=' + repoType
        } else if (hrefVal.indexOf(currentDocDomain) < 0 && hrefVal.indexOf(document.location.host) >= 0 && hrefVal.indexOf("/docs/") > 0 && getUrlVars(document.URL)["product"] && getUrlVars(document.URL)["product"] != getCurrentUrlProductName(changeHref)) {
            productVar = 'product=' + getUrlVars(document.URL)["product"] + '&repoType=' + repoType
        } else if (hrefVal.indexOf(currentDocDomain) >= 0 && getUrlVars(document.URL)["product"]) {
            productVar = 'product=' + getUrlVars(document.URL)["product"] + '&repoType=' + repoType
        }
        if (productVar && productVar != "") {
            productVar = (hrefVal.indexOf("?") > 0 ? '&' : '?') + productVar
        }
        var product = getUrlVars(document.URL)["product"]
        if (productVar != "" && product != undefined && getUrlVars(document.URL)[product] != undefined) {
            var productVersion = getUrlVars(document.URL)[product]
            if (productVersion != undefined) {
                productVar = productVar + "&" + product + "=" + productVersion
            }
        }
        // same docs, different repo
        var repoTypeVar = ""
        if (hrefVal.indexOf(currentDocDomain) >= 0 && !getUrlVars(document.URL)["product"]) {
            if (getCurrentUrlRepoType(hrefVal) != repoType) {
                repoTypeVar = '?repoType=' + repoType
            }
        }
        changeHref = hrefVal + productVar + repoTypeVar
	} else {
        var verStr = "";
        exp = new RegExp(/[?]+([^=]+)=/gi);
        if (verText != '' && verText != 'latest') {
            verStr = exp.exec(hrefVal) != null ? ("&&ver=" + verText) : ("?ver=" + verText)
        }
        var srcString = ""
        if (changeHref.indexOf("/server/programming/c-cplusplus/") > 0 && !getUrlVars(changeHref)["src"]) {
            if (getUrlVars(document.URL)["src"]) {
                srcString = exp.exec(hrefVal) == null && verStr == '' ? "?src=" + getUrlVars(document.URL)["src"] : "&&src=" + getUrlVars(document.URL)["src"]
            } else {
                srcString = exp.exec(hrefVal) == null && verStr == '' ? "?src=" + getCurrentUrlLang(document.URL) : "&&src=" + getCurrentUrlLang(document.URL)
            }
        }
        // different docs, different repo
        var productVar = ""
        if (!getUrlVars(changeHref)["product"]) {
            var isAddProductVersion = false
            if (hrefVal.indexOf(currentDocDomain) < 0 && hrefVal.indexOf(document.location.host) >= 0 && hrefVal.indexOf("/docs/") > 0 && !getUrlVars(document.URL)["product"]) {
                productVar = exp.exec(hrefVal) == null && verStr == '' && srcString == "" 
                ? ('?product=' + productName + '&repoType=' + repoType)  
                : ('&product=' + productName + '&repoType=' + repoType)
            } else if (hrefVal.indexOf(currentDocDomain) < 0 && hrefVal.indexOf(document.location.host) >= 0 && hrefVal.indexOf("/docs/") > 0 && getUrlVars(document.URL)["product"] && getUrlVars(document.URL)["product"] != getCurrentUrlProductName(changeHref)) {
                productVar = exp.exec(hrefVal) == null && verStr == '' && srcString == "" 
                ? ('?product=' + getUrlVars(document.URL)["product"] + '&repoType=' + repoType)  
                : ('&product=' + getUrlVars(document.URL)["product"] + '&repoType=' + repoType)
            } else if (hrefVal.indexOf(currentDocDomain) >= 0 && getUrlVars(document.URL)["product"]) {
                productVar = exp.exec(hrefVal) == null && verStr == '' && srcString == "" ? ('?product=' + getUrlVars(document.URL)["product"] + '&repoType=' + repoType) : ('&product=' + getUrlVars(document.URL)["product"] + '&repoType=' + repoType)
                var product = getUrlVars(document.URL)["product"]
                var productVersion = getUrlVars(document.URL)[product]
                if (productVersion != undefined) {
                    productVar = productVar + "&" + product + "=" + productVersion
                }
                isAddProductVersion = true
            }
            var product = getUrlVars(document.URL)["product"]
            if (!isAddProductVersion && productVar != "" && product != undefined && getUrlVars(document.URL)[product] != undefined) {
                var productVersion = getUrlVars(document.URL)[product]
                if (productVersion != undefined) {
                    productVar = productVar + "&" + product + "=" + productVersion
                }
            }
        }
        // same docs, different repo
        var repoTypeVar = ""
        if (!getUrlVars(changeHref)["repoType"]) {
            if (hrefVal.indexOf(currentDocDomain) >= 0 && !getUrlVars(document.URL)["product"]) {
                if (getCurrentUrlRepoType(hrefVal) != repoType) {
                    repoTypeVar = exp.exec(hrefVal) == null && verStr == '' && srcString == "" ? '?repoType=' + repoType : '&repoType=' + repoType
                }
            }
        }
        let hashIndex = hrefVal.indexOf("#")
        let queryIndex = hrefVal.indexOf("?")
        if (hashIndex != -1) {
            if (queryIndex != 1 && hashIndex < queryIndex) {
                var urlQuery = hrefVal.split("?")
                var urlHash = urlQuery[0].split("#")
                changeHref = urlHash[0] + "?" + urlQuery[1]+verStr+srcString+productVar + "#" + urlHash[1]
            } else {
                var urlAry = hrefVal.split("#");
                if (urlAry.length == 2){
                    changeHref = urlAry[0]+verStr+srcString+productVar+"#"+urlAry[1]
                }
            }
            
        } else {
            changeHref = hrefVal+verStr+srcString+productVar
        }
    }

    // 除了到 dcv docs 的跳转，其余文档需要打开新页面，不需要修改 Nav
    // 除dcv外，其他文档需要去查找到对应的版本号
    // && (verText == "latest" || verText == undefined)
    if (aTag.target == '_blank') {
        console.log(hrefVal)
        if (hrefVal.indexOf("/docs/") > 0 && hrefVal.indexOf(location.host) >= 0) {
            if (getUrlVars(hrefVal)["ver"]!=undefined) {
                window.open(hrefVal);
            } else {
                let hashIndex = hrefVal.indexOf("#")
                let queryIndex = hrefVal.indexOf("?")
                let anchorVal = null
                if (hashIndex != -1) {
                    if (queryIndex != -1 && hashIndex < queryIndex) {
                        let urlQuery = hrefVal.split("?")
                        let urlHash = urlQuery[0].split("#")
                        anchorVal = urlHash[1]
                        hrefVal = hrefVal.replace("#"+anchorVal, '')
                    } else if (queryIndex != -1 && hashIndex > queryIndex) {
                        anchorVal = hrefVal.split("#")[1]
                        hrefVal = anchorVal ? hrefVal.split("#")[0] : hrefVal
                    } else {
                        let urlAry = hrefVal.split("#");
                        if (urlAry.length == 2){
                            anchorVal = urlAry[1]
                        }
                    }
                }
                
                let currentVersion = $(".currentVersion").text().toLowerCase()
                currentVersion = currentVersion == "latest version" ? "latest" : (currentVersion.replace("version ", ""))
                if (getUrlVars(hrefVal)["product"] != undefined) {
                    let hrefVal_Product = getCurrentUrlProductName(hrefVal)
                    let productName = getUrlVars(hrefVal)["product"]
                    let productVersion = getDCVVer(currentVersion, hrefVal, null, null, productName)
                    let productRepoType = getUrlVars(hrefVal)["repoType"] ? getUrlVars(hrefVal)["repoType"] : getCurrentUrlRepoType(hrefVal)
                    let hrefVal_ProductVersion = getDCVVer(productVersion, null, productName, productRepoType, hrefVal_Product)
                    queryParam = `&${productName}=${productVersion}&repoType=${productRepoType}&ver=${hrefVal_ProductVersion}`
                    window.open(hrefVal + queryParam + anchorVal);
                } else {
                    let hrefVal_ProductVersion = getDCVVer(currentVersion, hrefVal)
                    if (queryIndex > 0) {
                        window.open(hrefVal + '&ver='+hrefVal_ProductVersion); 
                    } else {
                        window.open(hrefVal + '?ver='+hrefVal_ProductVersion); 
                    }
                }
            } 
        } else {
            window.open(hrefVal);
        }
    } else {
        if (fromSourse == "sidebar") {
            var currentHost = document.location.host 
            if (aTag.href.indexOf("/docs/") <= 0 || aTag.href.indexOf(currentHost) < 0) {
                window.location.href = aTag.href;
                return;
            }
            // request link
            if (!$(aTag).hasClass("activeLink")) {
                RequestNewPage(aTag, changeHref, needh3)
            }
        } else if (fromSourse == "docContainer") {
            findCurLinkOnFullTree(aTag, changeHref, needh3)
        } else {
            window.location.href = changeHref;
        }
    }
	return;
}

function RequestNewPage(aTag, paramLink, needh3=false, redirectUrl = null, onlyLoadContent=false) {
    $("#articleContent").addClass("hidden")
    $("#loadingContent").show()
    var fetchUrl = redirectUrl ? redirectUrl : aTag.href
    var oldLang = getCurrentUrlLang(document.URL)
    fetch(fetchUrl).then(function(response) {
        return response.text()
    }).then(function(data) {
        var inputVer = getUrlVars(paramLink)["ver"]
        var dcvVer = null
        if (getUrlVars(paramLink)["product"]) {
            dcvVer = getDCVVer(inputVer?inputVer:"latest", fetchUrl)
        }
        // console.log("dcvVer: " + dcvVer)
        var otherVersions = $(data).find(".otherVersions > li")

        var needToSearchHistory = false
        if (((!dcvVer || dcvVer == "latest")&&(inputVer == "latest" || inputVer == undefined)) || otherVersions.length == 0 || redirectUrl) {
            needToSearchHistory = false
        } else {
            needToSearchHistory = true
            inputVer = dcvVer ? dcvVer : inputVer
        }

        if (!needToSearchHistory) {
            document.title = $(data)[1].innerText

            // init language select container
            let languageWrapItem = $(data).find(".languageWrap")
            if (languageWrapItem && languageWrapItem.length > 0 && $(".languageWrap").length > 0) {
                languageWrapItem = languageWrapItem[0]
                let className = languageWrapItem.className.trim()
                let originClassName = $(".languageWrap").attr('class').trim()
                if (className != originClassName) {
                    $(".languageWrap").attr("class", className)
                    // mobile - ios 页面
                    var urlLang = getUrlVars(paramLink)["lang"]
                    if ($(".languageWrap.multiProgrammingLanguage").length > 0 && getCurrentUrlLang(paramLink, true) == "objectivec-swift") {
                        var curLang = $(".languageWrap .languageSelectDown > div.on").data("value")
                        if (!$(".languageWrap").hasClass("enableLanguageSelection")) {
                            let singleLang = ""
                            if ($(data).find(".language-swift").length > 0) {
                                singleLang = "swift"
                            } else {
                                singleLang = "objc"
                            }
                            if (singleLang != curLang) {
                                $(".languageWrap .languageSelectDown > div").removeClass("on")
                                let obj = $(".languageWrap .languageSelectDown > div")
                                for(var i=0; i<obj.length;i++) {
                                    if ($(obj[i]).data("value") == singleLang) {
                                        $(obj[i]).addClass("on")
                                        $(".languageWrap .languageChange .chosenLanguage").text($(obj[i]).text())
                                    }
                                }
                            }
                            curLang = singleLang
                        }
                        if (urlLang) {
                            paramLink = paramLink.replace('lang=' + urlLang, 'lang=' + curLang)
                        } else {
                            if (paramLink.indexOf("?")>0){
                                let tempHref = paramLink.split("?")
                                paramLink = tempHref[0] + '?lang=' + curLang + '&' + tempHref[1]
                            } else if (paramLink.indexOf("#") > 0) {
                                let tempHref = paramLink.split("#")
                                paramLink = tempHref[0] + '?lang=' + curLang + '#' + tempHref[1]
                            } else {
                                paramLink = paramLink + '?lang=' + curLang
                            }
                        }
                    } else {
                        if (urlLang) {
                            paramLink = paramLink.replace('lang=' + urlLang, '')
                        }
                    }
                }
            }

            !onlyLoadContent&&history.pushState(null, null, paramLink)

        
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
            loadActiveTagMenu(aTag)
            // $(aTag).parents("li.expandListStyle").addClass("hasActiveLinkList")

            var newLang = getCurrentUrlLang(document.URL)
            if (oldLang != newLang) {
                FilterLangFullTree()
            }

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
            if ($(data).find("#docHead").find(".iconsBox a").length > 0) {
                var editMdFileLink = $(data).find("#docHead").find(".iconsBox a")[0].href
                $("#docHead .iconsBox a").attr("href", editMdFileLink)
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
                $('#fullTreeMenuListContainer').removeClass('needh3');
                if (needh3) {
                    $('#fullTreeMenuListContainer').addClass('needh3');
                }
                GenerateContentByHead(needh3);
                if ($("#AutoGenerateSidebar > ul > li").length == 0) {
                    $(".rightSideMenu > p").hide()
                } else {
                    $(".rightSideMenu > p").show()
                }
            }
            $('#crumbs > ul').html($('#crumbs > ul > li').eq(0))
            initCrumbs()
            init()
            var preList = $('.markdown-body .highlight pre')
            for (var i=0; i<preList.length; i++) {
                var iconItem = document.createElement("i")
                iconItem.className = "copyIcon fa fa-copy"
                preList[i].appendChild(iconItem)
            }

            // scroll to the start of article
            var hash = paramLink.split("#").length > 1 ? paramLink.split("#")[1].toLowerCase() : null
            var sd = $(window).scrollTop()
            if (hash && $("#" + hash.toLowerCase()).length > 0) {
                window.scrollTo(0, $("#" + hash.toLowerCase()).offset().top)
            } else {
                if (sd > 0) {
                    window.scrollTo(0, sd > $('#overall-header').height() ? $('#overall-header').height() : sd)
                }
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

            let codeSampleStyle = $(data).filter(function(item) { return $(data).eq(item).attr("id") == "CodeAutoHeight"});
            if (codeSampleStyle && codeSampleStyle.length > 0) {
                if ($("#CodeAutoHeight").length == 0) {
                    $(".markdown-body .sample-code-prefix+blockquote ol li pre.highlight").css("max-height", "unset") 
                    $(".markdown-body .sample-code-prefix.template2 + blockquote > div pre.highlight").css("max-height", "unset") 
                }
            } else {
                $("#CodeAutoHeight").remove();
                $(".markdown-body .sample-code-prefix+blockquote ol li pre.highlight").css("max-height", "400px") 
                $(".markdown-body .sample-code-prefix.template2 + blockquote > div pre.highlight").css("max-height", "400px") 
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

            if (myMermaid) {
                myMermaid.run({
                    querySelector: '.language-mermaid',
                });
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

            // init fold-panel-prefix
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

            anchors.add();
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
                        RequestNewPage(aTag, paramLink, needh3, redirectTag.href, onlyLoadContent)
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
                    RequestNewPage(aTag, paramLink, needh3, redirectTag.href, onlyLoadContent)
                    return
                } else if (!matchSuccess) {
                    RequestNewPage(aTag, paramLink, needh3, aTag.href, onlyLoadContent)
                    return
                }
            }
        }
    })
}

function findCurLinkOnFullTree(aTag, paramLink, needh3=false, onlyLoadContent=false) {
    var fullTreeATags = $("#fullTreeMenuListContainer").find("a")
    var targetHref = aTag.href.toLowerCase()
    var curDocUrl = document.URL.toLowerCase()
    targetHref = targetHref.indexOf("?") > 0 ? targetHref.split("?")[0] : (targetHref.indexOf("#") > 0 ? targetHref.split("#")[0] : targetHref) 
    curDocUrl = curDocUrl.indexOf("?") > 0 ? curDocUrl.split("?")[0] : (curDocUrl.indexOf("#") > 0 ? curDocUrl.split("#")[0] : curDocUrl)

    if (curDocUrl == targetHref && (aTag.href.split("#").length > 1 || document.URL.split("#").length > 1)) {
        var hash = aTag.href.split("#").length > 1 ? aTag.href.split("#")[1].toLowerCase() : null
        window.scrollTo(0, hash && $("#" + hash.toLowerCase()).length > 0 ? $("#" + hash.toLowerCase()).offset().top : 0)
        !onlyLoadContent&&history.pushState(null, null, paramLink)
    } else {
        var flag = false
        for(var i=0; i<fullTreeATags.length; i++) {
            var searchHref = fullTreeATags[i].href
            searchHref = searchHref.indexOf("index.html") > 0 ? searchHref.replace("index.html", "") : searchHref
            targetHref = targetHref.indexOf("index.html") > 0 ? targetHref.replace("index.html", "") : targetHref
            searchHref = searchHref.indexOf("?") > 0 ? searchHref.split("?")[0] : (searchHref.indexOf("#") > 0 ? searchHref.split("#")[0] : searchHref) 
            
            if (searchHref && searchHref.toLowerCase() == targetHref) {
                // item is visible
                if (fullTreeATags[i].offsetParent !== null) {
                    flag = true
                    if ($(fullTreeATags[i]).hasClass("refreshLink")) {
                        $(fullTreeATags[i]).click()
                    } else {
                        RequestNewPage(fullTreeATags[i], paramLink, needh3, null, onlyLoadContent)
                    }
                } else {
                    var objs = $(fullTreeATags[i]).parents("li")
                    var ifOtherLangTag = false
                    for(var j=0; j<objs.length; j++) {
                        if ($(objs[j]).attr("otherlang") != undefined) {
                            ifOtherLangTag = true
                        }
                        if (!flag && $(objs[j]).attr("otherlang") == undefined && $(objs[j]).attr("lang") || document.URL.indexOf("/docs/web/") > 0) {
                            flag = true
                            if ($(fullTreeATags[i]).hasClass("refreshLink")) {
                                $(fullTreeATags[i]).click()
                            } else {
                                RequestNewPage(fullTreeATags[i], paramLink, needh3, null, onlyLoadContent)
                            }
                        }
                    }
                    if (!ifOtherLangTag && !flag) {
                        flag = true
                        if ($(fullTreeATags[i]).hasClass("refreshLink")) {
                            $(fullTreeATags[i]).click()
                        } else {
                            RequestNewPage(fullTreeATags[i], paramLink, needh3, null, onlyLoadContent)
                        }
                    }
                }
            } else if (searchHref.toLowerCase() == targetHref && (fullTreeATags[i]).hasClass("refreshLink")) {
                flag = true
                $(fullTreeATags[i]).click()
            }
        }
        if (!flag) {
            // use modal to display page if not in the menu tree
            showPageContentInModal(paramLink)
            // window.location.href = paramLink;
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
    var langVar = getUrlVars(curUrl)["lang"];
    var productVar = getUrlVars(curUrl)["product"];
    var repoTypeVar =getUrlVars(curUrl)["repoType"];
    
    if (productVar !=undefined && productVar != getCurrentUrlProductName() && getCurrentUrlProductName() != "dcv") {
        var menuLis = $("#fullTreeMenuListContainer > li")
        for(var i=0;i<menuLis.length;i++) {
            let aTag = $(menuLis[i]).find(" > a").eq(0).attr("href")
            if($(menuLis[i]).is(":visible") && aTag) {
                window.location.href = aTag + "?ver=" + ver;
                return;
            }
        }
    }

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
    var productVersion = null;
    if (productVar != undefined && getCurrentUrlProductName() == "dcv") {
        var dcvVer = getDCVVer(ver, document.URL)
        if (dcvVer != -1) {
            productVersion = ver
            ver = dcvVer
        } else {
            var menuLis = $("#fullTreeMenuListContainer > li")
            for(var i=0;i<menuLis.length;i++) {
                let aTag = $(menuLis[i]).find(" > a").eq(0).attr("href")
                if($(menuLis[i]).is(":visible") && aTag) {
                    window.location.href = aTag + "?ver=" + ver;
                    return;
                }
            }
        }
    }
    if (ver != 'latest') {
        curUrl = curUrl + "?ver=" + ver + "&&cVer=true";
    } else {
        RedirToGivenVersionPage("latest");
        return
    }
	
	if (srcVal != undefined) {
		curUrl = curUrl + "&&src=" + srcVal;
	}
    if (langVar != undefined) {
        curUrl = curUrl + "&&lang=" + langVar;
    }
    if (productVar != undefined) {
        curUrl = curUrl + "&&product=" + productVar + "&&repoType=" + repoTypeVar
        if (getCurrentUrlProductName() == "dcv") {
            curUrl = curUrl + "&&"+ productVar +"=" + productVersion;
        }
    }
	if (anchorVar != undefined) {
		curUrl = curUrl + "#" + anchorVar;
	}
	window.location.href = curUrl;
	return;
}

function findNearestVersion(ver) {
    var versionList = $(".fullVersionInfo li:not(.hideLi)")
    var bestVer = ver, verDiff=null
    // console.log(versionList)
    for (var i=0; i<versionList.length; i++) {
        var tempVer = $(versionList[i]).text().toLowerCase()
        if (tempVer == "latest version"){
            tempVer = "latest"
        } else {
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

function loadActiveTagMenu(aTag) {
    let ulTag = $(aTag).parent().parent("ul")
    $(aTag).parent("li").addClass("hasActiveLinkList")
    if (ulTag.length>0) {
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

function initHistoryVersionList() {
    let lang = getCurrentUrlLang(document.URL, true)
    if (lang == 'objectivec-swift') {
        lang = 'ios'
    }
    let obj = $(".fullVersionInfo li")
    for (var i=0; i<obj.length; i++) {
        let edition = $(obj[i]).data("editions")
        if (edition && edition != "" && edition.split('_').indexOf(lang) < 0) {
            $(obj[i]).addClass("hideLi").hide()
        }
    }
}

function getCurrentUrlProductName(url=null) {
    url = url ? url.replace("https://", "") : null
    var currentPath = url ? url.replace(url.split('/')[0], "") : document.location.pathname
    currentPath = currentPath.slice(1, currentPath.length)
    var productParam = currentPath.split('/')[0]
    switch (productParam) {
        case 'web-twain': return 'dwt';
        case 'barcode-reader': return 'dbr';
        case 'label-recognition': return 'dlr';
        case 'camera-enhancer': return 'dce';
        case 'code-parser': return 'dcp';
        case 'document-normalizer': return 'ddn';
        case 'capture-vision': return 'dcv'
        default: return '';
    }
}

function getCurrentUrlRepoType(url) {
    var currentPath = url
    if (currentPath.includes("/docs/server/")) {
        return 'server'
    }
    if (currentPath.includes("/docs/core/")) {
        return 'core'
    }
    if (currentPath.includes("/docs/mobile/")) {
        return 'mobile'
    }
    if (currentPath.includes("/docs/web/")) {
        return 'web'
    }
}

function showPageContentInModal(fetchUrl) {
    fetch(fetchUrl).then(function(response) {
        return response.text()
    }).then(function(data) {
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
            if($("#docsModal .markdown-body .sample-code-prefix").length > 0 && getUrlVars(fetchUrl)["lang"]) {
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
                for (var i=0; i<template2Objs.length; i++) {
                    $(template2Objs[i]).find(">div").eq(0).addClass('on')
                }
            }
        } else {
            window.location.href = fetchUrl
        }
    }).catch(function(e) {
        window.location.href = fetchUrl
    })
}

function closeDocsModal() {
    $("#docsModal").remove()
}

function getDCVVer(inputVer, url, curProduct=null, curRepoType=null, linkProduct=null) {
    // console.log(inputVer, url, curProduct, curRepoType, linkProduct)
    // get current url product & repoType
    let product = curProduct ? curProduct : (getUrlVars(document.URL)["product"] ? getUrlVars(document.URL)["product"] : getCurrentUrlProductName())
    let repoType = curRepoType ? curRepoType : (getUrlVars(document.URL)["repoType"] ? getUrlVars(document.URL)["repoType"] : getCurrentUrlRepoType(document.URL))
    let urlProduct = linkProduct ? linkProduct: getCurrentUrlProductName(url)
    if (!product || product == "") {
        return "latest"
    }
    
    repoType = repoType && repoType == "web" ? "js" : repoType
    inputVer = inputVer ? getFormatVal(inputVer) : 999999
    // console.log("product:" + product)
    // console.log("repoType: " + repoType)
    // console.log("inputVer: " + inputVer)
    // console.log("urlProduct: " + urlProduct)

    var productDCVVersionList = dcvVersionList.filter(function(item) {
        let aFlag = false
        let bFlag = false
        for(var key in item) {
            if (key == product) {
                aFlag = true
                item.version = item[key]
            }
        }
        if (aFlag) {
            for(var key in item.matchList) {
                if (key == urlProduct) {
                    bFlag = true
                    item.linkedProductVersion = item.matchList[key][0]
                }
            }
        }
        return aFlag && bFlag && (!item.repoType || repoType == item.repoType) && (!inputVer||inputVer >= getFormatVal(item.version))
    })

    // console.log(productDCVVersionList)

    productDCVVersionList.sort(function(a, b) {
        return getFormatVal(b.version) - getFormatVal(a.version)
    })

    if (productDCVVersionList && productDCVVersionList.length > 0) {
        return productDCVVersionList[0].linkedProductVersion
    } else {
        return -1
    }
}

function getFormatVal(inputVer) {
    if (inputVer == "latest") {
        return 999999
    }
    var arr = inputVer.split(".")
    var sum = 0
    if(arr.length == 2) {
        arr.push(0)
    }
    for(var i=0; i<arr.length; i++) {
        var num = Number(arr[i])
        sum = sum * 100 + num
    }
    return sum
}


window.addEventListener("popstate", function(e) {
    findCurLinkOnFullTree(location, location.href, false, true)
}, false)