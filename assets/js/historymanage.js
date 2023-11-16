function UrlReplace()
{
    initHistoryVersionList()
    var docUrl = document.URL;
    var ver = getUrlVars(docUrl)["ver"];
    var matchVer = getUrlVars(docUrl)["matchVer"];
    var product = getUrlVars(docUrl)["product"];
    var docProduct = getCurrentUrlProductName();
    if (ver != undefined && ver != "latest") {
        if (product == undefined || product == docProduct) {
            var tempVer = findNearestVersion(ver);
            if (tempVer != ver) {
                var replaceUrl = docUrl.replace("ver=" + ver, "ver=" + tempVer)
                window.location.replace(replaceUrl);
            }
        }
    }

    if (matchVer == undefined && ver != undefined) {
        var productVersion = getUrlVars(docUrl)[product]
        if (product != undefined && product != docProduct && productVersion == undefined) {
            productVersion = getLinkVersion(ver, docUrl, product, getUrlVars(docUrl)["lang"] ? getUrlVars(docUrl)["lang"] : 'core', docProduct)
            docUrl = docUrl.replace("ver="+ver, "ver="+productVersion+"&"+product+"="+ver)
            window.location.replace(docUrl);
        } else {
            RedirToGivenVersionPage(ver);
        }
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
    var curVerTag = $(".currentVersion");
    var bestVerIndex = -1;
    var verDiff = -1;
    var curVer = null;
    if (curVerTag != null) {
        var verText = (curVerTag[0].innerHTML).toLowerCase();
        if (verText == "latest version"){
            curVer = "latest"
        }
        else{
            curVer = verText.replace('version ','');
        }
        if (curVer == inputVer) {
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
        changeVer = "&cVer=true";
    }

    var productVar = ""
    var productParam = getUrlVars(document.URL)["product"];
    var langParam = getUrlVars(document.URL)["lang"];
    
    console.log(productParam, langParam)
    

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
                if (aTag.length > 0 && aTag[0].href) {
                    var exp = new RegExp(/[?]+([^=]+)=/gi)
                    if (exp.exec(aTag[0].href) != null) { // aTag[0].href中有参数
                        if (productParam != undefined && getCurrentUrlProductName() == productParam) {
                            productVar = `&product=${productParam}${langParam!=undefined?'&lang='+langParam:''}`
                            if (getUrlVars(document.URL)[productParam] != undefined) {
                                productVar += ("&"+productParam + "=" + getUrlVars(document.URL)[productParam])
                            }
                        }
                        if (inputVer == 'latest') {
                            window.location.replace(aTag[0].href + productVar + anchorVal);
                        } else {
                            window.location.replace(aTag[0].href + "&ver=" +inputVer+"&matchVer=true" + productVar + changeVer + anchorVal);
                        }
                        return;
                    }
                    else {
                        var srcVal = getUrlVars(document.URL)["src"]
                        var redirectUrl = aTag[0].href
                    	if (srcVal != undefined){
                            redirectUrl = redirectUrl + '?src=' + srcVal
                    	}
                        if (langParam != undefined) {
                            redirectUrl = srcVal != undefined ? (redirectUrl + '&lang=' + langParam) : (redirectUrl + '?lang=' + langParam)
                        }
                        if (productParam != undefined && getCurrentUrlProductName() != productParam) {
                            productVar = `${redirectUrl.indexOf("?") > 0 ? '&' : '?'}product=${productParam}`
                            if (getUrlVars(document.URL)[productParam] != undefined) {
                                productVar += ("&"+productParam + "=" + getUrlVars(document.URL)[productParam])
                            }
                            redirectUrl = redirectUrl + productVar
                        }
                        if (inputVer == 'latest') {
                            console.log(redirectUrl + anchorVal)
                            console.log(1)
                            window.location.replace(redirectUrl + anchorVal)
                        } else {
                            console.log(2)
                            window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}ver=${inputVer}&matchVer=true${changeVer}${anchorVal}`)
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
                console.log(5)
                window.location.replace(aTag[0].href + "&ver=" +inputVer+"&matchVer=true"+ changeVer + anchorVal);
                return;
            } else {
                var srcVal = getUrlVars(document.URL)["src"]
                var redirectUrl = aTag[0].href
                if (srcVal != undefined){
                    redirectUrl = redirectUrl + "?src="+ srcVal
                }
                if (langParam != undefined) {
                    redirectUrl = srcVal != undefined ? (redirectUrl + "&lang="+ langParam) : (redirectUrl + "?lang="+ langParam)
                }
                if (productParam != undefined && getCurrentUrlProductName() != productParam) {
                    productVar = "&product=" + productParam
                    if (getUrlVars(document.URL)[productParam] != undefined) {
                        productVar += ("&"+productParam + "=" + getUrlVars(document.URL)[productParam])
                    }
                }
                console.log(3)
                window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}ver=${inputVer}&matchVer=true${productVar}${changeVer}${anchorVal}`)
                return;
            }
        }
    }

    if (inputVer == "latest") {
        var srcVal = getUrlVars(curDocUrl)["src"]
        var redirectUrl = curDocUrl.indexOf("?") > 0 ? curDocUrl.split("?")[0] : curDocUrl
        if (srcVal != undefined) {
            redirectUrl = redirectUrl + '?src='+ srcVal
        }
        if (langParam != undefined) {
            redirectUrl = srcVal != undefined ? (redirectUrl + '&lang=' + langParam) : (redirectUrl + '?lang=' + langParam)
        }
        if (productParam != undefined && getCurrentUrlProductName() != productParam) {
            productVar = `${redirectUrl.indexOf("?") > 0 ? '&' : '?'}product=${productParam}`
            if (getUrlVars(document.URL)[productParam] != undefined) {
                productVar += ("&"+productParam + "=" + getUrlVars(document.URL)[productParam])
            }
            redirectUrl = redirectUrl + productVar
        }
        console.log(4)
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
    var inputChar = inputVer ? inputVer.split('.') : inputVer;
    var compareChar = compareVer ? compareVer.split('.') : compareVer;
    
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
    let originHref = aTag.href
    let hrefVal = aTag.href;
    let productName = getUrlVars(document.URL)["product"] || getCurrentUrlProductName(document.URL)
    let lang = getUrlVars(document.URL)["lang"] || getCurrentUrlLang(document.URL, true)
    let currentDocDomain = document.URL.split("/docs/")[0] + '/docs/';
    let p_ver = getUrlVars(document.URL)[productName]
    if (p_ver != undefined) {
        verText = p_ver
    }

    if(hrefVal == "") return;

    if (hrefVal.indexOf("/docs/") <= 0 || hrefVal.indexOf(location.host) < 0)  {
        window.open(aTag.href)
        return
    }

    console.log(aTag, verText)

    // #region hash & src,lang,ver
    // get hash string
    let hashIndex = hrefVal.indexOf("#")
    let queryIndex = hrefVal.indexOf("?")
    let hashStr = ""
    if (hashIndex != -1) {
        if (queryIndex != 1 && hashIndex < queryIndex) {
            var urlQuery = hrefVal.split("?")
            var urlHash = urlQuery[0].split("#")
            hashStr = "#" + urlHash[1]
        } else {
            var urlAry = hrefVal.split("#");
            hashStr = urlAry.length == 2 ? ("#" + urlAry[1]) : ""
        }
    }
    hrefVal = hrefVal.replace(hashStr, "")

    // mobile - ios 页面 - swift&objc 语言切换
    let urlLang = getUrlVars(hrefVal)["lang"]
    if ($(".languageWrap.multiProgrammingLanguage").length > 0 && getCurrentUrlLang(hrefVal, true) == "objectivec-swift") {
        let curLang = $(".languageWrap .languageSelectDown > div.on").data("value")
        if (urlLang) {
            hrefVal = hrefVal.replace('lang=' + urlLang, 'lang=' + curLang)
            
        } else {
            hrefVal = `${hrefVal}${hrefVal.indexOf("?")>0?'&':'?'}lang=${curLang}`
        }
    }

    // get src string, href += src string (准备把这个参数和lang参数统一，以后只考虑lang)
    var srcString = ""
    expQueryStr = new RegExp(/[?]+([^=]+)=/gi);
    if (hrefVal.indexOf("/server/programming/c-cplusplus/") > 0 && !getUrlVars(hrefVal)["src"]) {
        if (getUrlVars(document.URL)["src"]) {
            srcString = expQueryStr.exec(hrefVal) == null ? "?src=" + getUrlVars(document.URL)["src"] : "&src=" + getUrlVars(document.URL)["src"]
        } else {
            srcString = expQueryStr.exec(hrefVal) == null ? "?src=" + getCurrentUrlLang(document.URL) : "&src=" + getCurrentUrlLang(document.URL)
        }
    }
    hrefVal = hrefVal + srcString
    
    // new link dosen't have version, use current link version 
    var expVersion = new RegExp(/[?&]ver=[^&^#]+/gi);
    var verStr = ""
    if (expVersion.exec(hrefVal) == null && verText != '' && verText != 'latest') {
        verStr = expQueryStr.exec(hrefVal) != null ? ("&ver=" + verText) : ("?ver=" + verText)
    }
    hrefVal = hrefVal + verStr
    // #endregion

    // #region 分析出 productVar, langVar
    // different docs, different language
    var productVar = ""
    if (!getUrlVars(hrefVal)["product"]) {
        var isNeedAddProductVersion = false
        var isNeedAddLang = false
        if (hrefVal.indexOf(currentDocDomain) < 0 && hrefVal.indexOf(document.location.host) >= 0 && hrefVal.indexOf("/docs/") > 0) {
            if (!getUrlVars(document.URL)["product"]) {
                // dbr js --> dce
                productVar = `${expQueryStr.exec(hrefVal) == null?'?':'&'}product=${productName}`;
                isNeedAddLang = true
            } else if (getUrlVars(document.URL)["product"] != getCurrentUrlProductName(hrefVal)) {
                // dce dbr --> dlr
                productVar = `${expQueryStr.exec(hrefVal) == null?'?':'&'}product=${getUrlVars(document.URL)['product']}`;
                isNeedAddLang=true
            } else if (getUrlVars(document.URL)["product"] == getCurrentUrlProductName(hrefVal) && getCurrentUrlLang(hrefVal, true) != lang) {
                // dce-dbrjs --> dbr core 需要加上 lang
                isNeedAddLang = true
            }
        } else if (hrefVal.indexOf(currentDocDomain) >= 0 && getUrlVars(document.URL)["product"]) {
            // dce-dbr --> dce -- dbr
            productVar = `${expQueryStr.exec(hrefVal) == null?'?':'&'}product=${getUrlVars(document.URL)['product']}`;
            isNeedAddLang = true
            isNeedAddProductVersion = true
        }

        if (isNeedAddLang) {
            if (lang != "") {
                if (getUrlVars(hrefVal)["lang"]) {
                    hrefVal.replace(`lang=${getUrlVars(hrefVal)["lang"]}`, `lang=${lang}`)
                } else {
                    productVar += `${expQueryStr.exec(hrefVal) == null && productVar==""?'?':'&'}lang=${lang}`
                }
            }
        }
    }
    // same docs, different language
    if (!getUrlVars(hrefVal)["lang"]) {
        if (hrefVal.indexOf(currentDocDomain) >= 0 && !getUrlVars(document.URL)["product"]) {
            if (getCurrentUrlLang(hrefVal, true) != lang && lang != "") {
                if (getUrlVars(hrefVal)["lang"]) {
                    hrefVal.replace(`lang=${getUrlVars(hrefVal)["lang"]}`, `lang=${lang}`)
                } else {
                    productVar += `${expQueryStr.exec(hrefVal) == null && productVar==""?'?':'&'}lang=${lang}`
                }
            }
        }
    }
    hrefVal = hrefVal + productVar
    // #endregion

    console.log(`2. hrefVal: ${hrefVal}`)

    if (aTag.target == '_blank') {
        if (getUrlVars(originHref)["ver"]!=undefined) {
            window.open(originHref);
        } else {
            let hashIndex = originHref.indexOf("#")
            let queryIndex = originHref.indexOf("?")
            let anchorVal = ""
            if (hashIndex != -1) {
                if (queryIndex != -1 && hashIndex < queryIndex) {
                    let urlQuery = originHref.split("?")
                    let urlHash = urlQuery[0].split("#")
                    anchorVal = '#' + urlHash[1]
                    originHref = originHref.replace(anchorVal, '')
                } else if (queryIndex != -1 && hashIndex > queryIndex) {
                    anchorVal = '#' + originHref.split("#")[1]
                    originHref = anchorVal ? originHref.split("#")[0] : originHref
                } else {
                    let urlAry = originHref.split("#");
                    if (urlAry.length == 2){
                        anchorVal = '#' + urlAry[1]
                    }
                }
            }
            let currentVersion = $(".currentVersion").text().toLowerCase()
            currentVersion = currentVersion == "latest version" ? "latest" : (currentVersion.replace("version ", ""))
            
            if (getUrlVars(originHref)["product"] != undefined) {
                // dbr 文档中打开 dcv.....?product=dlr
                let fProductName = getUrlVars(originHref)["product"]
                // 获取 dlr 相对于 dbr 的 version (dbrVer, originHref, curProduct, curLang, fProductName)
                let fProductVersion = getLinkVersion(currentVersion, null, productName, lang, fProductName) // 切换获取方式
                if (fProductVersion == -1) {
                    fProductVersion = currentVersion
                }
                let fProductLang = getUrlVars(originHref)["lang"] ? getUrlVars(originHref)["lang"] : getCurrentUrlLang(originHref, true)
                let hrefVal_Product = getCurrentUrlProductName(originHref)
                // 获取 dcv 相对于 dlr 的 version
                let hrefVal_ProductVersion = getLinkVersion(fProductVersion, null, fProductName, fProductLang, hrefVal_Product)
                if (hrefVal_ProductVersion == -1) {
                    hrefVal_ProductVersion = fProductVersion
                }
                if (getUrlVars(originHref)["lang"] != undefined) {
                    queryParam = `&${fProductName}=${fProductVersion}&ver=${hrefVal_ProductVersion}`
                } else {
                    queryParam = `&${fProductName}=${fProductVersion}${fProductLang?'&lang=' + fProductLang : ''}&ver=${hrefVal_ProductVersion}`
                }
                window.open(originHref + queryParam + anchorVal);
            } else {
                let isCoreDocs = false
                if (getUrlVars(document.URL)["product"] && !getUrlVars(document.URL)["lang"]) {
                    isCoreDocs = true
                } else if (document.URL.indexOf("/docs/core/")) {
                    isCoreDocs = true
                }
                // link product & link language
                var linkProduct = getCurrentUrlProductName(originHref)
                var linkLang = getCurrentUrlLang(originHref, true)
                var dceLang = ["cordova", "xamarin", "flutter", "react-native"]

                if (isCoreDocs && (linkLang && linkProduct == productName || linkProduct == 'dce' && dceLang.includes(linkLang))) {
                    if (linkLang && linkProduct == productName) { // core-> normal lang 
                        window.open(`${originHref}${currentVersion=='latest' ? '' : (queryIndex > 0 ? '&ver=' + currentVersion : '?ver=' + currentVersion)}${anchorVal}`); 
                    } else { // core -> dcv lang
                        let dcvLangVersion = getDCVLangVersion(linkLang, productName, currentVersion)
                        if (dcvLangVersion == -1) {
                            dcvLangVersion = currentVersion
                        }
                        window.open(`${originHref}${queryIndex > 0 ? '&' : '?'}ver=${dcvLangVersion}${anchorVal}`); 
                    }
                } else {
                    if (linkProduct == productName && lang) { // dbr js to dbr core, dbr js to dbr ios 等
                        var linkLangVersion = getProductLangLatestVersion(dceLang.includes(linkLang) && linkProduct != "dcv" ? "dcv" : linkProduct, linkLang != '' ? linkLang : 'core')
                        var curLangVersion = getProductLangLatestVersion(dceLang.includes(lang) && productName != "dcv" ? "dcv" : productName, lang)
                        var changeVersion = currentVersion
                        if (changeVersion == "latest" && getFormatVal(curLangVersion) < getFormatVal(linkLangVersion)) {
                            changeVersion = curLangVersion
                        }
                        window.open(`${originHref}${queryIndex > 0 ? '&' : '?'}ver=${changeVersion}${anchorVal}`); 
                    } else {
                        // e.g. core to dcv..., 
                        // e.g. dbr文档中打开 dlr链接，注意查找到dlr相对于dbr的版本号
                        let hrefVal_ProductVersion = getLinkVersion(currentVersion, originHref, productName, lang)
                        if (hrefVal_ProductVersion == -1) {
                            hrefVal_ProductVersion = currentVersion
                        }
                        if (hrefVal_ProductVersion == "latest") {
                            window.open(originHref + anchorVal); 
                        } else {
                            if (queryIndex > 0) {
                                window.open(originHref + '&ver='+hrefVal_ProductVersion + anchorVal); 
                            } else {
                                window.open(originHref + '?ver='+hrefVal_ProductVersion + anchorVal);
                            }
                        }
                    }
                }
            }
        }
    } else {
        if (fromSourse == "sidebar") {
            // request link
            if (!$(aTag).hasClass("activeLink")) {
                RequestNewPage(aTag, hrefVal + hashStr, needh3)
            }
        } else if (fromSourse == "docContainer") {
            findCurLinkOnFullTree(aTag, hrefVal + hashStr, needh3)
        } else {
            window.location.href = hrefVal + hashStr;
        }
    }
	return;
}

function RequestNewPage(aTag, paramLink, needh3=false, redirectUrl = null, onlyLoadContent=false) {
    $("#articleContent").addClass("hidden")
    $("#loadingContent").show()
    var fetchUrl = redirectUrl ? redirectUrl : aTag.href
    var oldLang = getCurrentUrlLang(document.URL)

    console.log(paramLink)
    fetch(fetchUrl, {cache: "no-cache"}).then(function(response) {
        return response.text()
    }).then(function(data) {
        var inputVer = getRequestNewPageVersion(paramLink)
        console.log(inputVer)
        var otherVersions = $(data).find(".otherVersions > li")

        var needToSearchHistory = false
        if ((inputVer == "latest" || inputVer == undefined) || otherVersions.length == 0 || redirectUrl) {
            needToSearchHistory = false
        } else {
            needToSearchHistory = true
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
                    if ($(".languageWrap.multiProgrammingLanguage").length > 0 && isInIOSDos(document.URL, paramLink)) {
                        var curLang = $(".languageWrap .languageSelectDown > div.on").data("value")
                        console.log(curLang, urlLang)
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
                            if (isInIOSDos(document.URL, paramLink)) {
                                paramLink = paramLink.replace('lang=' + urlLang, '')
                                if(paramLink && paramLink.indexOf("?") >= 0) {
                                    var item = paramLink.split("?")[1].trim()
                                    if (item == "" || item[0] == "#") {
                                        paramLink = paramLink.replace('?', '')
                                    }
                                }
                            } else {
                                paramLink = paramLink.replace('lang=' + urlLang, 'lang=objc,swift')
                            }
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
            if (hash && $("#" + hash).length > 0) {
                var scrollTop = $("#" + hash).offset().top
                setTimeout(function() {
                    window.scrollTo(0, scrollTop)
                }, 100)
            } else {
                if (sd > 0) {
                    var scrollTop = sd > $('#overall-header').height() ? $('#overall-header').height() : sd
                    setTimeout(function() {
                        window.scrollTo(0, scrollTop)
                    }, 100)
                }
            }

            // multi panel switching start
            let multiPanelListSwitchingItems = $(".multi-panel-switching-prefix")
            for (let i =0; i < multiPanelListSwitchingItems.length; i++) {
                let multiPanelSwitchBtns = $(multiPanelListSwitchingItems[i]).find("+ul > li")
                let switchIndex = 0
                if (hash && hash != "") {
                    for(let j=0; j < multiPanelSwitchBtns.length; j++) {
                        if ('#' + $(multiPanelSwitchBtns[j]).find("a").attr("href") == hash) {
                            switchIndex = j
                        }
                    }
                }
                $(multiPanelSwitchBtns[switchIndex]).addClass("on")
                let nextSiblings = $(multiPanelListSwitchingItems[i]).find("+ul ~")
                showSelectMultiPanel(nextSiblings, switchIndex)
            }

            $(".multi-panel-switching-prefix + ul > li").on("click", function() {
                $(this).parent("ul").find("li").removeClass("on")
                $(this).addClass("on")
                let nextSiblings = $(this).parent("ul").find("~")
                showSelectMultiPanel(nextSiblings, $(this).index())
            })
            
            // load sample-code style
            if($(".markdown-body .sample-code-prefix").length > 0 && getUrlVars(document.URL)["lang"]) {
                var langs =  getUrlVars(document.URL)["lang"]
                if(langs!= undefined && langs == "objectivec-swift") {
                    langs = "objc,swift"
                }
                langs = langs.toLowerCase().trim().split(",")
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
	} else {
		ver = innertext.replace('version ','');
	}
	var curUrl = document.URL;
	var srcVal = getUrlVars(curUrl)["src"];
    var langVar = getUrlVars(curUrl)["lang"];
    var productVar = getUrlVars(curUrl)["product"];

	var anchorVar = undefined;
	if (curUrl.indexOf("#") != -1) {
		anchorVar = (curUrl.split("#")).pop();
	}
	if (curUrl.indexOf("?") != -1) {
		curUrl = curUrl.substring(0, curUrl.indexOf("?"));
	}
	if (curUrl.indexOf("#") != -1){
		curUrl = curUrl.substring(0, curUrl.indexOf("#"));
	}

    var productVersion = null;
    if (productVar != undefined && getCurrentUrlProductName() != productVar) {
        var needVer = getLinkVersion(ver, document.URL, productVar, langVar ? langVar : 'core', getCurrentUrlProductName())
        if (needVer != -1) {
            productVersion = ver
            ver = needVer
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
        curUrl = curUrl + "?ver=" + ver + "&cVer=true";
    } else {
        RedirToGivenVersionPage("latest");
        return
    }
	
	if (srcVal != undefined) {
		curUrl = curUrl + "&src=" + srcVal;
	}
    if (langVar != undefined) {
        curUrl = curUrl + "&lang=" + langVar;
    }
    if (productVar != undefined) {
        curUrl = curUrl + "&product=" + productVar
        if (getCurrentUrlProductName() != productVar) {
            curUrl = curUrl + "&"+ productVar +"=" + productVersion;
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
    url = url ? url.replace("http://", "") : null
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

function getRequestNewPageVersion(linkUrl) {
    var curVersion = getUrlVars(linkUrl)["ver"]
    curVersion = curVersion==undefined ? "latest" : curVersion
    var queryProduct = getUrlVars(linkUrl)["product"]
    var queryLang = getUrlVars(linkUrl)["lang"]
    if (queryProduct == undefined) {
        // same product
        if (queryLang == undefined || linkUrl.indexOf("/docs/core/") < 0) { // same product, same language
            return curVersion
        } else { // same product, lang to core
            if (curVersion == "latest") {
                var searchLang = queryLang
                var productName = getCurrentUrlProductName(linkUrl)
                var dceLang = ["cordova", "xamarin", "flutter", "react-native"]
                var langLV = getProductLangLatestVersion(dceLang.includes(searchLang) && productName != "dcv" ? "dcv" : productName, searchLang)
                var coreLV = getProductLangLatestVersion(getCurrentUrlProductName(linkUrl), "core")
                if (getFormatVal(langLV) < getFormatVal(coreLV)) {
                    return langLV
                }
            }
            return curVersion
        }
    } else {
        // different product
        var product = queryProduct || getCurrentUrlProductName(linkUrl)
        var lang = queryLang || getCurrentUrlLang(linkUrl, true)
        console.log(curVersion, product, lang,  getCurrentUrlProductName(linkUrl))
        var returnVersion = getLinkVersion(curVersion, linkUrl, product, lang ? lang : 'core', getCurrentUrlProductName(linkUrl))
        return returnVersion == -1 ? curVersion : returnVersion
    }
}

/**
 * Get Link Version
 * @param {*} curVersion 
 * @param {*} linkUrl 
 * @param {*} curProduct 
 * @param {*} curLang 
 * @param {*} linkProduct 
 * @returns 
 * 
 * test example
 * getLinkVersion("10.0.10", null, "dbr", "cpp", "dlr")
 * getLinkVersion("10.0.10", null, "dbr", "core", "dlr")
 * getLinkVersion("10.0.10", "https://www.dynamsoft.com/capture-vision/docs/core/enums/utility/region-predetection.html", "dbr", "core", "dcv")
 * getLinkVersion("10.0.10", "https://www.dynamsoft.com/capture-vision/docs/core/enums/utility/region-predetection.html", "dbr", "cpp", "dcv")
 */

function getLinkVersion(curVersion, linkUrl, curProduct=null, curLang=null, linkProduct=null) {
    // 需要得到是 currcent link: product, language
    // 得到 product
    let product = curProduct ? curProduct : (getUrlVars(document.URL)["product"] ? getUrlVars(document.URL)["product"] : getCurrentUrlProductName())
    // 得到 language 
    let lang = curLang ? curLang : (getUrlVars(document.URL)["lang"] ? getUrlVars(document.URL)["lang"] : getCurrentUrlLang(document.URL, true))
    
    lang = lang == "cplusplus" ? "cpp" : lang
    lang = ["objectivec-swift", "objectivec", "objc", "swift"].includes(lang) ? "ios" : lang
    lang = lang == "core" ? "" : lang

    // 找到对应的 matchList
    let filteredItems = dcvVersionList.filter(function(item) {
        let productVersion = item[product+'Core']
        let isReturn = false
        let matchItems = null
        if (productVersion && getFormatVal(productVersion) <= getFormatVal(curVersion)) {
            for(var matchItem in item.matchList) {
                if (lang && lang != "") {
                    if (matchItem == lang) {
                        var tempMatchItems = item.matchList[matchItem]
                        for(var subMatchItems in tempMatchItems) {
                            if (linkProduct != "dcv") {
                                if (subMatchItems == linkProduct) {
                                    matchItems = tempMatchItems[subMatchItems]
                                    isReturn = true
                                }
                            } else {
                                if (linkUrl.indexOf("/docs/core/") > 0 && subMatchItems == "dcvRepoCore") {
                                    matchItems = tempMatchItems["dcvRepoCore"]
                                    isReturn = true
                                }
                                if (linkUrl.indexOf("/docs/core/") < 0 && subMatchItems == "dcvRepo") {
                                    matchItems = tempMatchItems["dcvRepo"]
                                    isReturn = true
                                }
                            }
                        }
                    }
                } else {
                    if (linkProduct != "dcv") {
                        if (matchItem == linkProduct) {
                            matchItems = item.matchList[matchItem]
                            isReturn = true
                        }
                    } else {
                        if (linkUrl.indexOf("/docs/core/") > 0 && matchItem == "dcvRepoCore") {
                            matchItems = item.matchList["dcvRepoCore"]
                            isReturn = true
                        }
                        if (linkUrl.indexOf("/docs/core/") < 0 && matchItem == "dcvRepo") {
                            matchItems = item.matchList["dcvRepo"]
                            isReturn = true
                        }
                    }
                }
            }
        }
        item.matchItems = matchItems
        item.productVersion = item[product+'Core']
        return isReturn
    })

    console.log(filteredItems)
    filteredItems.sort(function(a, b) {
        return getFormatVal(b.productVersion) - getFormatVal(a.productVersion)
    })
    if (filteredItems && filteredItems.length > 0) {
        var findMatchItems = filteredItems[0]["matchItems"]
        if (linkProduct != "dcv") {
            return findMatchItems
        } else {
            var dcvMatchItem = findMatchItems.filter(function(dcvMatch) {
                return linkUrl.indexOf(dcvMatch.path) > 0
            })
            return dcvMatchItem && dcvMatchItem.length > 0 ? dcvMatchItem[0].version : -1
        }
    } else {
        return -1
    }
}

//getDCVLangVersion('flutter', 'dbr', '10.0.0')
function getDCVLangVersion(linkLang, curProduct, curVersion) {
    let filteredItems = dcvVersionList.filter(function(item){
        let productVersion = item[curProduct+'Core']
        let isReturn = false
        let linkLangDCVVersion = null
        if (productVersion && getFormatVal(productVersion) <= getFormatVal(curVersion)) {
            for(var matchItem in item.matchList) {
                if (matchItem == linkLang) {
                    linkLangDCVVersion = item.matchList[matchItem].dcv
                    isReturn = true
                }
            }
        }
        item.linkLangDCVVersion = linkLangDCVVersion
        item.productVersion = item[curProduct+'Core']
        return isReturn
    })

    filteredItems.sort(function(a, b) {
        return getFormatVal(b.productVersion) - getFormatVal(a.productVersion)
    })

    if (filteredItems && filteredItems.length > 0) {
        return filteredItems[0].linkLangDCVVersion
    } else {
        return -1
    }
}

function getProductLangLatestVersion(product, lang) {
    var productMatch = docsLangLatestVersion[product]
    var langVersion = productMatch[lang]
    return langVersion
}

function getFormatVal(inputVer) {
    if (!inputVer|| inputVer == "latest") {
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

function isInIOSDos(curUrl, linkUrl) {
    var curProduct = getCurrentUrlProductName(curUrl)
    var linkProduct = getCurrentUrlProductName(linkUrl)
    if (curProduct != linkProduct) {
        return false
    } else {
        if (linkUrl.indexOf("/docs/mobile/programming/objectivec-swift/") > 0) {
            return true
        } else {
            return false
        }
    }
}

window.addEventListener("popstate", function(e) {
    findCurLinkOnFullTree(location, location.href, false, true)
}, false)