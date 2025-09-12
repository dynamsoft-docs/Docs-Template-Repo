var dcvVersionList = []
var isUseOldFunction = false
// isArchiveDocsLink = true
// 1. dbr/docs/xxxx?ver=old (isArchiveDocsLink = true, 目录中有 docs-archive链接时的处理要注意，不能新窗口打开)
// 这种情况 urlReplace的时候用新的应该也没有关系，只需要找到对应的版本号页面不用加后缀和判断后缀
// 3. dbr/xxxx?product=dcv&ver=old，不能重定向, isArchiveDocsLink=true, 需要注意的是目录树等得用archive的
// 这种情况的 dcvVersionList 也要更新，需要用 archive 的，因为要找到 dcv 然后其他方法暂定用 old 版本，看看能不能适应新版本

// #region UrlReplace
async function UrlReplace()
{
    // 获取当前页面的产品参数
    var docUrl = document.URL;
    var product = getUrlVars(docUrl)["product"];
    var docProduct = getCurrentUrlProductName();
    product = product == docProduct ? null : product;
    var ver = getUrlVars(docUrl)["ver"];
    var matchVer = getUrlVars(docUrl)["matchVer"];
    var productVersion = product ? getUrlVars(docUrl)[product] : null

    dcvVersionList = await getVersionSearchList();
    docsLangLatestVersion = await getLatestVersionFile(product || docProduct, getCurrentUrlLang(docUrl, true))
    IsArchiveDocsLink(document.URL);

    // 注意 dcv 相关产品的versionList可能要访问dcv页面获取，因为本身文档不再包含产品页面
    await initHistoryVersionList(productVersion?productVersion:ver);

    if (product == "dcv" && isArchiveDocsLink) {
        dcvVersionList = await getVersionSearchList(true);
        isUseOldFunction = true
        UrlReplace_Old(docUrl, product, docProduct, ver, matchVer, productVersion)
    } else {
        if (product == 'dcv' && DcvProducts.indexOf(docProduct) >= 0) {
            docProduct = product
            product = null
            $("#categoryMenuTree .docSearchPart").remove()
        }
        if (product == "dbr") {
            $("#categoryMenuTree .docSearchPart").remove()
        }
        UrlReplace_New(docUrl, product, docProduct, ver, matchVer, productVersion)
    }
}

/**
 * 
 * @param {*} docUrl
 * @param {*} product //真正所在文档产品
 * @param {*} docProduct //页面链接的产品
 * @param {*} ver // 文档产品版本号 || 页面链接的产品版本号
 * @param {*} matchVer // 已做匹配
 * @param {*} productVersion // 文档产品版本号
 * @returns 
 */
function UrlReplace_Old(docUrl, product, docProduct, ver, matchVer, productVersion) {
    // 一、若链接格式为dcv/docs/xxxxx?product=dbr，给它赋值上 ver=latest，重定向后进入三
    if (docProduct && product && docProduct == "dcv" && docProduct != product && ver==undefined && productVersion == undefined) {
        ver = "latest"
        docUrl = docUrl.replace("product=" + product, "product=" + product + "&ver=latest")
    }

    // 二、有 ver 并且 ver ！= latest
    if (ver != undefined && ver != "latest") {
        // DCV已经匹配完成的情况
        // dcv/docs/xxxx?ver=2.1.0&matchVer=true
        if (product == undefined && docProduct == "dcv" && matchVer == "true") {
            return
        }
        // 不存在 product 参数的情况
        // dbr/docs/xxxx?ver=10.0.10
        if ((product == undefined || product == docProduct)) {
            // 由于给出的 ver不一定是正确的，可能是用户手动修改的，先做版本号的修正
            // tempVer: 找到 historyVersion中最接近的给出版本号的版本
            var tempVer = findNearestVersion(ver);
            // dcv/docs/xxxxx?ver=2.1.0
            // 由于 dcv文档老的版本比较混乱可能存在一个目录一个版本号的情况
            // 自身文档还存在一套版本匹配机制 总版本号下不同的目录有不同的版本号
            // 因此需要根据链接参数的ver去找到页面真正的ver
            if (docProduct == "dcv") {
                //根据链接参数的ver去找到页面真正的ver
                tempVer = getLinkVersion(ver, document.URL, null, null, docProduct)
                if (tempVer == -1) {
                    tempVer = "latest"
                }
            }

            // 两个 ver 不等，并且非dcv文档，需要做链接替换
            if (tempVer != ver && docProduct != "dcv") {
                var replaceUrl = docUrl.replace("ver=" + ver, "ver=" + tempVer)
                window.location.replace(replaceUrl);
            } else if (docProduct == "dcv") {
                // dcv 文档，去重定向到正确版本号页面
                RedirToGivenVersionPageForDCV_Old(tempVer, ver)
                return
            }

            // ver正确，有matchVer不做操作，无则进入步骤三
        }
    }

    productVersion = getUrlVars(docUrl)[product]
    // 三、未做过匹配，ver 或者 productVer 有一个存在
    if (matchVer == undefined && (ver != undefined || productVersion != undefined)) {
        if (product != undefined && product != docProduct && productVersion == undefined && ver != undefined) {
            // 例如 dcv/docs/xxxxx?product=dbr&ver=10.2.10
            // 1. 此时ver代表 dbr 的版本号，找到 dbr的 10.2.10 中匹配的 dcv 版本号
            // 2. 做链接替换
            productVersion = getLinkVersion(ver, docUrl, product, getUrlVars(docUrl)["lang"] ? getUrlVars(docUrl)["lang"] : 'core', docProduct)
            if (productVersion == -1) {
                productVersion = "latest"
            }
            docUrl = docUrl.replace("ver="+ver, "ver="+productVersion+"&"+product+"="+ver)
            window.location.replace(docUrl)
        } else if (product != undefined && product != docProduct && productVersion != undefined && ver == undefined) {
            // 例如 dbr/docs/xxxxx?product=dcv&dcv=xxx
            // 此时 ver 缺失，dcv=xxx中，直接指明了dcv的版本号，根据 dcv的xxx版本号找到 dbr的版本号
            // 做链接替换
            var curPageVer = getLinkVersion(productVersion, docUrl, product, getUrlVars(docUrl)["lang"] ? getUrlVars(docUrl)["lang"] : 'core', docProduct)
            if (curPageVer == -1) {
                curPageVer = "latest"
            }
            docUrl = docUrl.replace(product+"="+productVersion, product+"="+productVersion+"&ver="+curPageVer)
            // 去找到页面的真正version 如 dbr/docs/xxxxx?product=dcv&dcv=2.1.0&ver=10.2.10 --> dbr/docs/xxxxx-v10.2.10?product=dcv&dcv=2.1.0&ver=10.2.10
            RedirToGivenVersionPage(curPageVer, docUrl);
        } else {
            // 1. product != undefined && ver != undefined && productVersion != undefined
            // 如 dbr/docs/xxxxx?product=dcv&dcv=2.1.0&ver=10.2.10
            // 去找到页面的真正version 如 dbr/docs/xxxxx?product=dcv&dcv=2.1.0&ver=10.2.10 --> dbr/docs/xxxxx-v10.2.10?product=dcv&dcv=2.1.0&ver=10.2.10
            // 2. product == undefined && ver != undefined (此时不会有productVersion存在，不然链接需要修复，先不考虑这种情况)
            RedirToGivenVersionPage(ver?ver:'latest');
        }
    }

    // 四、页面链接参数不完整的情况， 既链接中含有 -v，但是参数中不包含 ver，需要将ver添加到链接，重定向跳转后会再执行一遍 urlReplace，根据具体情况按照二或者三走
    // dbr/docs/xxxxx-v10.2.10?product=dcv
    if (ver == undefined && productVersion == undefined) {
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

function UrlReplace_New(docUrl, product, docProduct, ver, matchVer, productVersion) {
    let lang = getCurrentUrlLang(docUrl, true)
    let pLatestVer = getProductLangLatestVersion(product?product:docProduct, lang)
    let pLatestVer_nearestVer = findNearestVersion(pLatestVer)
    // 一、页面链接参数不完整的情况
    // 即链接中含有 -v，但是参数中不包含 ver，需要将ver添加到链接，重定向跳转后会再执行一遍 urlReplace，根据具体情况按照二或者三走
    // 如 dbr/docs/xxxxx-v10.2.10?product=dcv， dbr/docs/xxxxx-v10.2.10
    if (ver == undefined && productVersion == undefined) {
        if (docUrl.indexOf("-v") > 0 && (docUrl.indexOf("-v") < docUrl.indexOf("?") || docUrl.indexOf("?") < 0)) {
            var tempArr = docUrl.split("-v")
            var docVer = tempArr[tempArr.length - 1]
            if (parseInt(docVer[0]) <= 9 && parseInt(docVer[0]) >= 0 && docVer.indexOf('.html') > 0) {
                docVer = docVer.split(".html")[0]
                docVer = getFormatVal(docVer) > getFormatVal(pLatestVer) ? "latest" : docVer
                if (product || (docVer == pLatestVer && pLatestVer == pLatestVer_nearestVer)) {
                    if (docUrl.indexOf("?") < 0) {
                        window.location.replace(docUrl + "?ver=latest");
                    } else {
                        window.location.replace(docUrl + "&ver=latest");
                    }
                } else {
                    if (docUrl.indexOf("?") < 0) {
                        window.location.replace(docUrl + "?ver=" + docVer);
                    } else {
                        window.location.replace(docUrl + "&ver=" + docVer);
                    }
                }
            }
        }
    }

    // 二、若链接为 dbr/docs/xxxx?product=dcv 或者 dcv/docs/xxxx?product=dbr，给它赋值上 ver=latest 进入四
    if (docProduct && product && ver == undefined && productVersion == undefined) {
        ver = "latest"
    }

    // 三、有 ver 并且 ver!=latest 并且不存在 product 参数的情况（product参数存在的话页面上的版本号列表就是不正确的，无法直接修复）
    // dbr/docs/xxxx?ver=10.0.10
    // 由于给出的 ver不一定是正确的，可能是用户手动修改的，先做版本号的修正
    if (ver != undefined && ver != "latest" && !product) {
        // tempVer: 找到 historyVersion中最接近的给出版本号的版本
        var tempVer = findNearestVersion(ver);
        // 两个 ver 不等，需要做链接替换
        if (tempVer != ver && !(tempVer == "latest" && ver == pLatestVer)) {
            var replaceUrl = docUrl.replace("ver=" + ver, "ver=" + tempVer)
            window.location.replace(replaceUrl);
        }
        // ver正确，有matchVer不做操作，无则进入步骤三
    }

    productVersion = getUrlVars(docUrl)[product]
    // 四、未做过匹配 并且 ver 或者 productVer 有一个存在
    if (matchVer == undefined && (ver != undefined || productVersion != undefined)) {
        if (product && productVersion == undefined && ver != undefined) {
            // 例如 dcv/docs/xxxxx?product=dbr&ver=10.2.10; dcv/docs/xxxxx?product=dbr,ver=latest
            // 1. 此时ver代表 dbr 的版本号，找到 dbr的 10.2.10 中匹配的 dcv 版本号
            // 2. 做链接替换
            productVersion = getLinkVersion(ver, docUrl, product, getUrlVars(docUrl)["lang"] ? getUrlVars(docUrl)["lang"] : 'core', docProduct)
            if (productVersion == -1) {
                productVersion = "latest"
            }
            
            if (docUrl.indexOf("ver=") > 0) {
                docUrl = docUrl.replace("ver="+ver, "ver="+productVersion+"&"+product+"="+ver)
            } else {
                // 针对二的情况
                docUrl = docUrl.replace("product="+product, "product="+product + "&ver="+productVersion+"&"+product+"="+ver)
            }
            // 去找到页面的真正version 如 dbr/docs/xxxxx?product=dcv&dcv=2.1.0&ver=10.2.10 --> dbr/docs/xxxxx-v10.2.10?product=dcv&dcv=2.1.0&ver=10.2.10
            RedirToGivenVersionPage(productVersion, docUrl);
        } else if (product && productVersion != undefined && ver == undefined) {
            // 例如 dbr/docs/xxxxx?product=dcv&dcv=xxx
            // 此时 ver 缺失，dcv=xxx中，直接指明了dcv的版本号，根据 dcv的xxx版本号找到 dbr的版本号
            // 做链接替换
            var curPageVer = getLinkVersion(productVersion, docUrl, product, getUrlVars(docUrl)["lang"] ? getUrlVars(docUrl)["lang"] : 'core', docProduct)
            if (curPageVer == -1) {
                curPageVer = "latest"
            }
            docUrl = docUrl.replace(product+"="+productVersion, product+"="+productVersion+"&ver="+curPageVer)
            // 去找到页面的真正version 如 dbr/docs/xxxxx?product=dcv&dcv=2.1.0&ver=10.2.10 --> dbr/docs/xxxxx-v10.2.10?product=dcv&dcv=2.1.0&ver=10.2.10
            RedirToGivenVersionPage(curPageVer, docUrl);
        } else {
            // 1. product != undefined && ver != undefined && productVersion != undefined
            // 如 dbr/docs/xxxxx?product=dcv&dcv=2.1.0&ver=10.2.10
            // 去找到页面的真正version 如 dbr/docs/xxxxx?product=dcv&dcv=2.1.0&ver=10.2.10 --> dbr/docs/xxxxx-v10.2.10?product=dcv&dcv=2.1.0&ver=10.2.10
            // 2. product == undefined && ver != undefined (此时不会有productVersion存在，不然链接需要修复，先不考虑这种情况)
            // 如 dlr/docs/xxxxx?ver=xxxx
            RedirToGivenVersionPage(ver?ver:'latest', docUrl);
        }
    }
    // 五、针对 lang latest version 与 目录树文件 latest version 不一致的情况。
    // 如 dbr-server 的目录树 version 最高为 11，但是 python 为 10.5.2100
    // 如果一个文件存在 latest version 和 10.5.2100 两个版本，那么 python 的 latest version 展示的应该是 10.5.2100 页面
    if (matchVer == undefined && pLatestVer_nearestVer != "latest" && (product && (productVersion == undefined || productVersion == "latest") || !product && (ver == undefined || ver == "latest"))) {
       RedirToGivenVersionPage(pLatestVer_nearestVer, docUrl)
    }
}

// #endregion

// #region RedirToGivenVersionPageForDCV
function RedirToGivenVersionPageForDCV_Old(pageVer, docVer) {
    //https://officecn.dynamsoft.com:808/capture-vision/docs/core/parameters/reference/barcode-reader-task-settings/dpm-code-reading-modes.html?ver=2.2.0
    var bestVerIndex = -1;
    var verDiff = -1;
    var curVer = pageVer;
    var anchorVal = "";
    var historyList = $(".otherVersions");

    var curPageVersion = null
    if (document.URL.indexOf("-v")>0) {
        curPageVersion = SearchVersion(document.URL.indexOf("?") > 0 ? document.URL.split("?")[0] : document.URL)[0]
    }

    if (curPageVersion && curPageVersion==pageVer) {
        return;
    } else {
        bestVerIndex = -1;
        verDiff = GetVersionDiff(pageVer, curPageVersion ? curPageVersion : 'latest');
        bestVersion = curVer;
        if (verDiff == 0) {
            return;
        }
    }

    if (document.URL.indexOf("#") != -1){
		var urlAry = document.URL.split("#");
		if (urlAry.length == 2){
            anchorVal = "#" + urlAry[1].toLowerCase();
		}
	}

    if (historyList != null) {
        var listAry = historyList [0].getElementsByTagName("li");
        for (var i = 0; i < listAry.length; i++) {
            var tmpVerText = listAry[i].innerText;
            var tmpVer = null;
            if (tmpVerText.indexOf("latest version") >= 0) {
                tmpVer = "latest"
            } else {
                tmpVer = tmpVerText.replace('version ','');
            }
            if (tmpVer == pageVer) {
                var aTag = $(listAry[i]).children("a");
                if (aTag.length > 0 && aTag[0].href) {
                    var exp = new RegExp(/[?]+([^=]+)=/gi)
                    if (exp.exec(aTag[0].href) != null) {
                        if (inputVer == 'latest') {
                            window.location.replace(aTag[0].href)
                        } else {
                            window.location.replace(aTag[0].href + "&ver=" + docVer + "&matchVer=true" + anchorVal)
                        }
                        return;
                    } else {
                        var redirectUrl = aTag[0].href
                        if (inputVer == 'latest') {
                            window.location.replace(redirectUrl + anchorVal)
                        } else {
                            window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}ver=${docVer}&matchVer=true${anchorVal}`)
                        }
                       return;
                    }
                }
            } else {
                var tmpDiff = GetVersionDiff(pageVer, tmpVer);
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
                window.location.replace(aTag[0].href + "&ver="+docVer+"&matchVer=true" + anchorVal)
                return;
            } else {
                var srcVal = getUrlVars(document.URL)["src"]
                var redirectUrl = aTag[0].href
                if (srcVal != undefined){
                    redirectUrl = redirectUrl + "?src="+ srcVal
                }
                window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}ver=${docVer}&matchVer=true${anchorVal}`)
                return;
            }
        }
    }

    if (pageVer == "latest" || bestVerIndex == -1) {
        var srcVal = getUrlVars(document.URL)["src"]
        var redirectUrl = document.URL.indexOf("?") > 0 ? document.URL.split("?")[0] : document.URL
        if (srcVal != undefined) {
            redirectUrl = redirectUrl + '?src='+ srcVal
        }
        if (pageVer == "latest") {
            window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}matchVer=true${anchorVal}`)
        } else {
            window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}ver=${docVer}&matchVer=true${anchorVal}`)
        }
    }
    return;
}
// #endregion

// #region RedirToGivenVersionPage
function RedirToGivenVersionPage(inputVer, currentUrl = null)
{
    //https://officecn.dynamsoft.com:808/camera-enhancer/docs/web/programming/javascript/api-reference/drawingitem-v3.3.8.html?ver=3.3.8
    var curVerTag = $(".currentVersion");
    var bestVerIndex = -1;
    var verDiff = -1;
    var curVer = null;
    var docUrl = currentUrl || document.URL;
    var curDocUrl = currentUrl || document.URL;
    if (curVerTag != null) {
        var verText = (curVerTag[0].innerHTML).toLowerCase();
        if (verText.indexOf("latest version") >= 0){
            curVer = "latest"
        }
        else{
            curVer = verText.replace('version ','');
        }
        var pageVersion = null
        if (docUrl.indexOf("-v")>0) {
            pageVersion = SearchVersion(docUrl.indexOf("?") > 0 ? docUrl.split("?")[0] : docUrl)[0]
        }
        if (curVer == inputVer && pageVersion && pageVersion==inputVer) {
            return;
        }
        else {
            bestVerIndex = -1;
            verDiff = GetVersionDiff(inputVer, pageVersion ? pageVersion : 'latest');
            bestVersion = curVer;
            if (verDiff == 0) {
                return;
            }
        }
    }
    
    var anchorVal = "";
    

    if (curDocUrl.indexOf("#") != -1){
		var urlAry = curDocUrl.split("#");
		if (urlAry.length == 2){
            anchorVal = "#" + urlAry[1].toLowerCase();
		}
	}

    var changeVer = "";
    var ifChangeVersion = getUrlVars(docUrl)["cVer"];
    if (ifChangeVersion != undefined) {
        changeVer = "&cVer=true";
    }

    var productVar = ""
    var productParam = getUrlVars(docUrl)["product"];
    var langParam = getUrlVars(docUrl)["lang"];
    let pLatestVer = getProductLangLatestVersion(productParam ? productParam : getCurrentUrlProductName(), getCurrentUrlLang(document.URL, true))
    let pLatestVer_nearestVer = findNearestVersion(pLatestVer)
    let addedVer = inputVer
    if (inputVer == pLatestVer && pLatestVer_nearestVer == pLatestVer && pLatestVer_nearestVer != "latest") {
        addedVer = "latest" 
    }
    var historyList = $(".otherVersions");

    if (historyList != null) {
        var listAry = historyList[0].getElementsByTagName("li");
        for (var i = 0; i < listAry.length; i++) {
            var tmpVerText = listAry[i].innerText;
            var tmpVer = null;
            if (tmpVerText.indexOf("latest version") >= 0){
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
                            if (getUrlVars(docUrl)[productParam] != undefined) {
                                productVar += ("&"+productParam + "=" + getUrlVars(docUrl)[productParam])
                            }
                        }
                        if (inputVer == 'latest') {
                            window.location.replace(aTag[0].href + productVar + anchorVal);
                        } else {
                            window.location.replace(aTag[0].href + "&ver=" +addedVer+"&matchVer=true" + productVar + changeVer + anchorVal);
                        }
                        return;
                    }
                    else {
                        var srcVal = getUrlVars(docUrl)["src"]
                        var redirectUrl = aTag[0].href
                            if (srcVal != undefined){
                            redirectUrl = redirectUrl + '?src=' + srcVal
                            }
                        if (langParam != undefined) {
                            redirectUrl = srcVal != undefined ? (redirectUrl + '&lang=' + langParam) : (redirectUrl + '?lang=' + langParam)
                        }
                        if (productParam != undefined && getCurrentUrlProductName() != productParam) {
                            productVar = `${redirectUrl.indexOf("?") > 0 ? '&' : '?'}product=${productParam}`
                            if (getUrlVars(docUrl)[productParam] != undefined) {
                                productVar += ("&"+productParam + "=" + getUrlVars(docUrl)[productParam])
                            }
                            redirectUrl = redirectUrl + productVar
                        }
                        if (inputVer == 'latest') {
                            window.location.replace(redirectUrl + anchorVal)
                        } else {
                            window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}ver=${addedVer}&matchVer=true${changeVer}${anchorVal}`)
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
                window.location.replace(aTag[0].href + "&ver=" +addedVer+"&matchVer=true"+ changeVer + anchorVal);
                return;
            } else {
                var srcVal = getUrlVars(docUrl)["src"]
                var redirectUrl = aTag[0].href
                if (srcVal != undefined){
                    redirectUrl = redirectUrl + "?src="+ srcVal
                }
                if (langParam != undefined) {
                    redirectUrl = srcVal != undefined ? (redirectUrl + "&lang="+ langParam) : (redirectUrl + "?lang="+ langParam)
                }
                if (productParam != undefined && getCurrentUrlProductName() != productParam) {
                    productVar = "&product=" + productParam
                    if (getUrlVars(docUrl)[productParam] != undefined) {
                        productVar += ("&"+productParam + "=" + getUrlVars(docUrl)[productParam])
                    }
                }
                window.location.replace(`${redirectUrl}${redirectUrl.indexOf("?") > 0?'&':'?'}ver=${addedVer}&matchVer=true${productVar}${changeVer}${anchorVal}`)
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
            if (getUrlVars(docUrl)[productParam] != undefined) {
                productVar += ("&"+productParam + "=" + getUrlVars(docUrl)[productParam])
            }
            redirectUrl = redirectUrl + productVar + "&matchVer=true"
        }
        window.location.replace(redirectUrl + anchorVal);
    }

    return;
}
// #endregion

// #region addParam
function addParam(aTag, verText, fromSourse = null, needh3 = false) {
    let hrefVal = aTag.href;
    if (hrefVal.indexOf(location.host + "/faq/") >= 0 && document.URL.indexOf(location.host + "/faq/") >= 0) {
        if (!$(aTag).hasClass("activeLink")) {
            RequestNewPage(aTag, hrefVal, needh3)
        }
        return
    } else {
        if (isUseOldFunction) {
            addParam_Old(aTag, verText, fromSourse, needh3)
        } else {
            addParam_New(aTag, verText, fromSourse, needh3)
        }
    }
}

function addParam_Old(aTag, verText, fromSourse=null, needh3=false)
{
    let originHref = aTag.href
    let hrefVal = aTag.href;
    let productName = getUrlVars(document.URL)["product"] || getCurrentUrlProductName(document.URL)
    let lang = getUrlVars(document.URL)["lang"] || getCurrentUrlLang(document.URL, true)
    let currentDocDomain = document.URL.split(docsFolderName)[0] + docsFolderName;
    let p_ver = getUrlVars(document.URL)[productName]
    if (p_ver != undefined) {
        verText = p_ver
    }

    // console.log(verText, p_ver)

    if(hrefVal == "") return;

    if (hrefVal.indexOf(docsFolderName) <= 0 || hrefVal.indexOf(location.host) < 0) {
        window.open(aTag.href)
        return
    }
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
    var expQueryStr = new RegExp(/[?]+([^=]+)=/gi);
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
    // console.log(hrefVal, verStr)
    // #endregion

    // #region 分析出 productVar, langVar
    // different docs, different language
    var productVar = ""
    if (dcvVersionList) {
        if (!getUrlVars(hrefVal)["product"]) {
            var isNeedAddProductVersion = false
            var isNeedAddLang = false
            if (hrefVal.indexOf(currentDocDomain) < 0 && hrefVal.indexOf(document.location.host) >= 0 && hrefVal.indexOf(docsFolderName) > 0) {
                if (!getUrlVars(document.URL)["product"]) {
                    // dbr js --> dcv
                    productVar = `${hrefVal.indexOf("?") < 0?'?':'&'}product=${productName}`;
                    isNeedAddLang = true
                } else if (getUrlVars(document.URL)["product"] != getCurrentUrlProductName(hrefVal)) {
                    // dcv dbr --> dlr
                    productVar = `${hrefVal.indexOf("?") < 0?'?':'&'}product=${getUrlVars(document.URL)['product']}`;
                    isNeedAddLang=true
                } else if (getUrlVars(document.URL)["product"] == getCurrentUrlProductName(hrefVal) && getCurrentUrlLang(hrefVal, true) != lang) {
                    // dcv-dbrjs --> dbr core 需要加上 lang
                    isNeedAddLang = true
                }
            } else if (hrefVal.indexOf(currentDocDomain) >= 0 && getUrlVars(document.URL)["product"]) {
                // dcv-dbr --> dcv -- dbr
                productVar = `${hrefVal.indexOf("?") < 0?'?':'&'}product=${getUrlVars(document.URL)['product']}`;
                isNeedAddLang = true
                isNeedAddProductVersion = true
                // console.log(productVar)
            }

            if (isNeedAddLang) {
                if (lang != "") {
                    if (getUrlVars(hrefVal)["lang"]) {
                        hrefVal.replace(`lang=${getUrlVars(hrefVal)["lang"]}`, `lang=${lang}`)
                    } else {
                        productVar += `${hrefVal.indexOf("?") < 0 && productVar==""?'?':'&'}lang=${lang}`
                    }
                }
            }
            // console.log(productVar)
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
    }

    hrefVal = hrefVal + productVar
    // #endregion

    // console.log(hrefVal)

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
            if(anchorVal && anchorVal != "") {
                originHref = originHref.replace(anchorVal, "")
            }
            let currentVersion = $(".currentVersion").text().toLowerCase()
            currentVersion = currentVersion.indexOf("latest version") >= 0 ? "latest" : (currentVersion.replace("version ", ""))
            
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
                } else if (document.URL.indexOf(docsFolderName + "core/")) {
                    isCoreDocs = true
                }
                // link product & link language
                var linkProduct = getCurrentUrlProductName(originHref)
                var linkLang = getCurrentUrlLang(originHref, true)
                var dcvLang = ["cordova", "xamarin", "flutter", "react-native", "maui"]
                if (isCoreDocs && (linkLang && linkProduct == productName || linkProduct == 'dcv' && dcvLang.includes(linkLang))) {
                    if (linkLang && linkProduct == productName) { // core-> normal lang 
                        window.open(`${originHref}${currentVersion=='latest' ? '' : (queryIndex > 0 ? '&ver=' + currentVersion : '?ver=' + currentVersion)}${anchorVal}`); 
                    } else { // core -> dcv lang
                        let dcvLangVersion = getDCVLangVersion(linkLang, currentVersion)
                        if (dcvLangVersion == -1) {
                            dcvLangVersion = currentVersion
                        }
                        window.open(`${originHref}${queryIndex > 0 ? '&' : '?'}ver=${dcvLangVersion}${anchorVal}`); 
                    }
                } else {
                    if (linkProduct == productName && lang) { // dbr js to dbr core, dbr js to dbr ios 等
                        var linkLangVersion = getProductLangLatestVersion(dcvLang.includes(linkLang) && linkProduct != "dcv" ? "dcv" : linkProduct, linkLang != '' ? linkLang : 'core')
                        var curLangVersion = getProductLangLatestVersion(dcvLang.includes(lang) && productName != "dcv" ? "dcv" : productName, lang)
                        var changeVersion = currentVersion
                        if (changeVersion == "latest" && getFormatVal(curLangVersion) < getFormatVal(linkLangVersion)) {
                            changeVersion = curLangVersion
                        }
                        window.open(`${originHref}${queryIndex > 0 ? '&' : '?'}ver=${changeVersion}${anchorVal}`); 
                    } else {
                        // e.g. core to dcv..., 
                        // e.g. dbr文档中打开 dlr链接，注意查找到dlr相对于dbr的版本号
                        let hrefVal_ProductVersion = getLinkVersion(currentVersion, originHref, productName, lang, linkProduct)
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
        } else if (fromSourse == "rightMenuContainer") {
            if (hashStr && $(hashStr.toLowerCase()).length > 0) {
                window.scrollTo(0, $(hashStr.toLowerCase()).offset().top - 160)
                var currentLinkHash = window.location.hash
                var currentLink = currentLinkHash ? document.URL.replace(currentLinkHash, hashStr) : (document.URL + hashStr)
                if (!$(aTag).hasClass("active")) {
                    history.pushState(null, null, currentLink)
                }
            } 
            else {
                window.location.href = hrefVal + hashStr;
            }
        } else {
           window.location.href = hrefVal + hashStr;
        }
    }
	return;
}

function addParam_New(aTag, verText, fromSourse=null, needh3=false) {
    let originHref = aTag.href
    let hrefVal = aTag.href;
    let productName = getUrlVars(document.URL)["product"] || getCurrentUrlProductName(document.URL)
    productName = (productName != "dbr" || !isArchiveDocsLink) && DcvProducts.indexOf(productName) >= 0 ? "dcv" : productName
    let lang = getUrlVars(document.URL)["lang"] || getCurrentUrlLang(document.URL, true)
    let archiveDocsFolderName =  docsFolderName.split("/v")[0] + "/"
    let currentDocDomain = document.URL.split(docsFolderName)[0] + archiveDocsFolderName;
    let p_ver = getUrlVars(document.URL)[productName]
    if (p_ver != undefined) {
        verText = p_ver
    }

    if(hrefVal == "") return;

    if (hrefVal.indexOf(docsFolderName) <= 0 || hrefVal.indexOf(location.host) < 0) {
        if ((productName != "dbr" && productName != "dcv") || hrefVal.indexOf(archiveDocsFolderName) <= 0) {
            window.open(aTag.href)
            return
        }
    }

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
    if (hrefVal.indexOf("/server/programming/c-cplusplus/") > 0 && !getUrlVars(hrefVal)["src"]) {
        if (getUrlVars(document.URL)["src"]) {
            srcString = hrefVal.indexOf("?") < 0 ? "?src=" + getUrlVars(document.URL)["src"] : "&src=" + getUrlVars(document.URL)["src"]
        } else {
            srcString = hrefVal.indexOf("?") < 0 ? "?src=" + getCurrentUrlLang(document.URL) : "&src=" + getCurrentUrlLang(document.URL)
        }
    }
    hrefVal = hrefVal + srcString
    
    // new link dosen't have version, use current link version 
    var expVersion = new RegExp(/[?&]ver=[^&^#]+/gi);
    var verStr = ""
    if (expVersion.exec(hrefVal) == null && verText != '' && verText != 'latest') {
        verStr = hrefVal.indexOf("?") > 0 ? ("&ver=" + verText) : ("?ver=" + verText)
    }
    hrefVal = hrefVal + verStr
    // #endregion

    // #region 分析出 productVar, langVar
    var productVar = "" 
    if (dcvVersionList) {
        var href_ProductName = getCurrentUrlProductName(hrefVal)
        // href_ProductName = (productName != "dbr" || !isArchiveDocsLink) && DcvProducts.indexOf(href_ProductName) >= 0 ? "dcv" : href_ProductName
        if (!getUrlVars(hrefVal)["product"]) {
            var isNeedAddLang = false
            if (hrefVal.indexOf("/docs-archive/") >= 0) {
                // dbr 文档中打开 dcv archive 页面
                productVar = `${hrefVal.indexOf("?") < 0?'?':'&'}product=${productName}`;
                isNeedAddLang = true
            } else if (hrefVal.indexOf(currentDocDomain) < 0 && (productName!="dcv" || DcvProducts.indexOf(href_ProductName) < 0)) {
                // different product docs
                if (!getUrlVars(document.URL)["product"] || getUrlVars(document.URL)["product"] != href_ProductName) {
                    // 例如：1. dbr/docs/web/xxxx ---> dcv/docs/web/xxxx
                    // 2. dcv/docs/web/xxxx?product=dbr --> dlr/docs/web/xxxx
                    productVar = `${hrefVal.indexOf("?") < 0?'?':'&'}product=${productName}`;
                    isNeedAddLang = true
                } else if (getUrlVars(document.URL)["product"] == href_ProductName && getCurrentUrlLang(hrefVal, true) != lang) {
                    // dcv/docs/web/xxxxx?product=dbr ---> dbr/docs/core  
                    // dcv-dbrjs --> dbr core 需要加上 lang
                    isNeedAddLang = true
                }
                // dcv/docs/web/xxxxxx?product=dbr ---> dbr/docs/web/xxxx (同product，同lang)
            } else {
                if (hrefVal.indexOf(currentDocDomain) >= 0) {
                    // 1. dbr/docs/xxxx -> dbr/docs/xxxxx, dcv/docs/web/xxxx --> dcv/docs/web/xxx
                    // 2. dcv/docs/web/xxxxx?product=dbr -> dcv/docs/web/xxxxx
                    // 3. dlr/xxx/ ?lang=python ---> dlr/xxxx/
                    if (href_ProductName != productName && (productName != "dcv" || DcvProducts.indexOf(href_ProductName) < 0) ) {
                        // 2
                        productVar = `${hrefVal.indexOf("?") < 0?'?':'&'}product=${productName}`;
                        isNeedAddLang = true
                    } else {
                        if (DcvProducts.indexOf(href_ProductName) >= 0 && getUrlVars(document.URL)["lang"]) {
                            isNeedAddLang = true
                        }
                        if (href_ProductName == productName && getCurrentUrlLang(hrefVal, true) != lang && lang != "") {
                            isNeedAddLang = true
                        }
                    }
                } else {
                    // productName=="dcv" && DcvProducts.indexOf(href_ProductName) >=0
                    if (href_ProductName == "dcv" && DcvProducts.indexOf(productName) >=0 && getCurrentUrlLang(hrefVal, true) == lang) {
                    } else {
                        isNeedAddLang = true
                    }
                }
            }

            if (isNeedAddLang) {
                if (lang != "") {
                    if (getUrlVars(hrefVal)["lang"]) {
                        hrefVal.replace(`lang=${getUrlVars(hrefVal)["lang"]}`, `lang=${lang}`)
                    } else {
                        productVar += `${hrefVal.indexOf("?") < 0 && productVar==""?'?':'&'}lang=${lang}`
                    }
                }
            }
        } else {
            if (!getUrlVars(hrefVal)["lang"]) {
                if ((hrefVal.indexOf(currentDocDomain) >= 0 || productName=="dcv" && DcvProducts.indexOf(href_ProductName) >=0) && !getUrlVars(document.URL)["product"]) {
                    if (getCurrentUrlLang(hrefVal, true) != lang && lang != "") {
                        if (getUrlVars(hrefVal)["lang"]) {
                            hrefVal.replace(`lang=${getUrlVars(hrefVal)["lang"]}`, `lang=${lang}`)
                        } else {
                            productVar += `${hrefVal.indexOf("?") < 0 && productVar==""?'?':'&'}lang=${lang}`
                        }
                    }
                }
            }
        }
    }

    hrefVal = hrefVal + productVar
    // #endregion
    if (aTag.target == '_blank') {
        if (getUrlVars(originHref)["ver"]!=undefined) {
            window.open(originHref);
        } else {
            let hashIndex = originHref.indexOf("#")
            let queryIndex = originHref.indexOf("?")
            let anchorVal = ""
            let queryParam = ""
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
            if(anchorVal && anchorVal != "") {
                originHref = originHref.replace(anchorVal, "")
            }
            let currentVersion = $(".currentVersion").text().toLowerCase()
            currentVersion = currentVersion.indexOf("latest version") >= 0 ? "latest" : (currentVersion.replace("version ", ""))
            
            if (getUrlVars(originHref)["product"] != undefined && getUrlVars(originHref)["product"] != productName) {
                if (productName == "dbr" && isArchiveDocsLink) {
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
                } else {
                    // 1、dbr 文档中打开 dlr.....?product=dcv
                    let fProductName = getUrlVars(originHref)["product"]
                    // 获取 dcv 相对于 dbr 的 version (dbrVer, originHref, curProduct, curLang, fProductName)
                    let fProductVersion = getLinkVersion(currentVersion, null, productName, lang, fProductName) // 切换获取方式
                    if (fProductVersion == -1) {
                        fProductVersion = currentVersion
                    }
                    queryParam = `&ver=${fProductVersion}`
                }
                window.open(originHref + queryParam + anchorVal);
            } else {
                // dbr --- dcv 或者 dcv --- dbr
                // dbr core --- dbr web
                if (productName == "dbr" && isArchiveDocsLink) { 
                    let isCoreDocs = false
                    if (getUrlVars(document.URL)["product"] && !getUrlVars(document.URL)["lang"]) {
                        isCoreDocs = true
                    } else if (document.URL.indexOf(docsFolderName + "core/")) {
                        isCoreDocs = true
                    }
                    // link product & link language
                    var linkProduct = getUrlVars(originHref)["product"] || getCurrentUrlProductName(originHref)
                    var linkLang = getCurrentUrlLang(originHref, true)
                    var dcvLang = ["cordova", "xamarin", "flutter", "react-native", "maui"]
                    if (isCoreDocs && (linkLang && linkProduct == productName || linkProduct == 'dcv' && dcvLang.includes(linkLang))) {
                        if (linkLang && linkProduct == productName) { // core-> normal lang 
                            window.open(`${originHref}${currentVersion=='latest' ? '' : (queryIndex > 0 ? '&ver=' + currentVersion : '?ver=' + currentVersion)}${anchorVal}`); 
                        } else { // core -> dcv lang
                            let dcvLangVersion = getDCVLangVersion(linkLang, currentVersion)
                            if (dcvLangVersion == -1) {
                                dcvLangVersion = currentVersion
                            }
                            window.open(`${originHref}${queryIndex > 0 ? '&' : '?'}ver=${dcvLangVersion}${anchorVal}`); 
                        }
                    } else {
                        if (linkProduct == productName && lang) { // dbr js to dbr core, dbr js to dbr ios 等
                            var linkLangVersion = getProductLangLatestVersion(dcvLang.includes(linkLang) && linkProduct != "dcv" ? "dcv" : linkProduct, linkLang != '' ? linkLang : 'core')
                            var curLangVersion = getProductLangLatestVersion(dcvLang.includes(lang) && productName != "dcv" ? "dcv" : productName, lang)
                            var changeVersion = currentVersion
                            if (changeVersion == "latest" && getFormatVal(curLangVersion) < getFormatVal(linkLangVersion)) {
                                changeVersion = curLangVersion
                            }
                            window.open(`${originHref}${queryIndex > 0 ? '&' : '?'}ver=${changeVersion}${anchorVal}`); 
                        } else {
                            // e.g. core to dcv..., 
                            // e.g. dbr文档中打开 dlr链接，注意查找到dlr相对于dbr的版本号
                            let hrefVal_ProductVersion = getLinkVersion(currentVersion, originHref, productName, lang, linkProduct)
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
                } else {
                    var linkProduct = getUrlVars(originHref)["product"] || getCurrentUrlProductName(originHref)
                    if (linkProduct == productName) {
                        if (currentVersion != "latest") {
                            queryParam = queryIndex > 0 ? `&ver=${currentVersion}` : `?ver=${currentVersion}`
                        }
                    } else {
                        // 1、dbr 文档中打开 dlr.....?product=dcv
                        // 获取 dcv 相对于 dbr 的 version (dbrVer, originHref, curProduct, curLang, fProductName)
                        let fProductVersion = getLinkVersion(currentVersion, null, productName, lang, linkProduct) // 切换获取方式
                        if (fProductVersion == -1) {
                            fProductVersion = currentVersion
                        }
                        if (currentVersion != "latest") {
                            queryParam = queryIndex > 0 ? `&ver=${fProductVersion}` : `?ver=${fProductVersion}`
                        }
                    }
                    window.open(originHref + queryParam + anchorVal);
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
        } else if (fromSourse == "rightMenuContainer") {
            if (hashStr && $(hashStr.toLowerCase()).length > 0) {
                window.scrollTo(0, $(hashStr.toLowerCase()).offset().top - 160)
                var currentLinkHash = window.location.hash
                var currentLink = currentLinkHash ? document.URL.replace(currentLinkHash, hashStr) : (document.URL + hashStr)
                if (!$(aTag).hasClass("active")) {
                    history.pushState(null, null, currentLink)
                }
            } 
            else {
                window.location.href = hrefVal + hashStr;
            }
        } else {
           window.location.href = hrefVal + hashStr;
        }
    }
	return;
}
// #endregion

// #region RequestNewPage
function RequestNewPage(aTag, paramLink, needh3=false, redirectUrl = null, onlyLoadContent=false) {
    $("#articleContent").addClass("hidden")
    $("#loadingContent").show()
    var fetchUrl = redirectUrl ? redirectUrl : aTag.href
    var oldLang = getCurrentUrlLang(document.URL)
    fetch(fetchUrl, {cache: "no-cache"}).then(function(response) {
        return response.text()
    }).then(function(data) {
        var inputVer = getRequestNewPageVersion(paramLink)
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
            $("#feedbackFooter a.smileLink").prop("href", "#")
            $("#feedbackFooter a.smileLink").on("click", function(e) {
                e.preventDefault()
                UsefulRecord(true)
                return false;
            })
            $("#feedbackFooter a.sadLink").prop("href", "#")
            $("#feedbackFooter a.sadLink").on("click", function(e) {
                e.preventDefault()
                UsefulRecord(true)
                return false;
            })
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

            if ($(".createCaseLink").length > 0) {
                var caseHref = $(".createCaseLink").attr("href")
                $(".createCaseLink").attr("href", caseHref + "&product=" + (getUrlVars(paramLink)["product"] || getCurrentUrlProductName(paramLink)));
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

            let latestPageUri = $(data).find("#latestPageUri")
            let curPageLatestPageUri = $("#latestPageUri")
            if (curPageLatestPageUri && curPageLatestPageUri.length > 0) {
                if (latestPageUri && latestPageUri.length > 0) {
                    let urlVal = $(latestPageUri).val()
                    $(curPageLatestPageUri).val(urlVal)
                } else {
                    $(curPageLatestPageUri).val("")
                }
            } else {
                if (latestPageUri && latestPageUri.length > 0) {
                    $("#docHead").append(latestPageUri)
                }
            }
            

            $('#crumbs > ul').html($('#crumbs > ul > li').eq(0))
            initCrumbs()
            init()
            $(".otherVersions").html($(data).find(".otherVersions").html()) 
            initNoteForOldVersions(otherVersions)
            var preList = $('.markdown-body .highlight pre')
            for (var i=0; i<preList.length; i++) {
                var iconItem = document.createElement("i")
                iconItem.className = "copyIcon fa fa-copy"
                preList[i].appendChild(iconItem)
            }

            // multi panel switching start
            let multiPanelListSwitchingItems = $(".multi-panel-switching-prefix")
            for (let i = 0; i < multiPanelListSwitchingItems.length; i++) {
                generateSwitchingItems($(multiPanelListSwitchingItems[i]), needh3)
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
                showSelectMultiPanel(nextSiblings, switchIndex, needh3)
            }

            $("article").on("click", ".multi-panel-switching-prefix + ul > li", function () {
                $(this).parent("ul").find("li").removeClass("on")
                $(this).addClass("on")
                let nextSiblings = $(this).parent("ul").nextAll()
                showSelectMultiPanel(nextSiblings, $(this).index(), needh3)
            })

            // load sample-code style
            if($(".markdown-body .sample-code-prefix").length > 0 && getUrlVars(document.URL)["lang"] != undefined) {
                var langs =  getUrlVars(document.URL)["lang"]
                if(langs!= undefined && langs == "objectivec-swift") {
                    langs = "objc,swift"
                }
                langs = langs.toLowerCase().trim().split(",")
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

            // scroll to the start of article
            var hash = paramLink.split("#").length > 1 ? paramLink.split("#")[1].toLowerCase() : null
            var sd = $(window).scrollTop()
            if (hash && $("#" + hash).length > 0) {
                var scrollTop = $("#" + hash).offset().top
                setTimeout(function() {
                    window.scrollTo(0, scrollTop - 160)
                    realFunc()
                }, 100)
            } else {
                if (sd > 0) {
                    var scrollTop = sd > $('#overall-header').height() ? $('#overall-header').height() : sd
                    setTimeout(function() {
                        window.scrollTo(0, scrollTop)
                        realFunc()
                    }, 100)
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
                    if (tmpVerText.indexOf("latest version") >= 0){
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
// #endregion

// #region findCurLinkOnFullTree
function findCurLinkOnFullTree(aTag, paramLink, needh3=false, onlyLoadContent=false, isRequestNewPage = false) {
    var fullTreeATags = $("#fullTreeMenuListContainer").find("a")
    var targetHref = aTag.href.toLowerCase()
    var curDocUrl = document.URL.toLowerCase()
    targetHref = targetHref.indexOf("?") > 0 ? targetHref.split("?")[0] : (targetHref.indexOf("#") > 0 ? targetHref.split("#")[0] : targetHref) 
    curDocUrl = curDocUrl.indexOf("?") > 0 ? curDocUrl.split("?")[0] : (curDocUrl.indexOf("#") > 0 ? curDocUrl.split("#")[0] : curDocUrl)
    if (curDocUrl == targetHref && (aTag.href.split("#").length > 1 || document.URL.split("#").length > 1) && !isRequestNewPage) {
        var hash = aTag.href.split("#").length > 1 ? aTag.href.split("#")[1].toLowerCase() : null
        var ulTags = $(aTag).parents("ul")
        if (ulTags.length <= 0 || !$(ulTags[0]).prev().hasClass("multi-panel-switching-prefix")) {
            if (hash && $("#" + hash.toLowerCase()).length > 0) {
                window.scrollTo(0, $("#" + hash.toLowerCase()).offset().top - 160)
            }
        }
        !onlyLoadContent&&history.pushState(null, null, paramLink)
    } else {
        var flag = false
        targetHref = targetHref.replace(/\/index-v[0-9]+[^\/]*.html/g,"/");
        targetHref = targetHref.replace(/-v[0-9]+[^\/]*\//g,"/");
        targetHref = targetHref.replace(/-v[0-9]+[^\/]*.html/g,".html");
        targetHref = targetHref.indexOf("index.html") > 0 ? targetHref.replace("index.html", "") : targetHref
        for(var i=0; i<fullTreeATags.length; i++) {
            if (!flag) {
                var searchHref = fullTreeATags[i].href
                searchHref = searchHref.replace(/\/index-v[0-9]+[^\/]*.html/g,"/");
                searchHref = searchHref.replace(/-v[0-9]+[^\/]*\//g,"/");
                searchHref = searchHref.replace(/-v[0-9]+[^\/]*.html/g,".html");
                searchHref = searchHref.indexOf("?") > 0 ? searchHref.split("?")[0] : (searchHref.indexOf("#") > 0 ? searchHref.split("#")[0] : searchHref) 
                searchHref = searchHref.indexOf("index.html") > 0 ? searchHref.replace("index.html", "") : searchHref
                if (searchHref && searchHref.toLowerCase() == targetHref.toLowerCase()) {
                    // item is visible
                    if (fullTreeATags[i].offsetParent !== null) {
                        flag = true
                        if ($(fullTreeATags[i]).hasClass("refreshLink")) {
                            $(fullTreeATags[i]).trigger("click")
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
                            if (!flag && ($(objs[j]).attr("otherlang") == undefined && $(objs[j]).attr("lang") || document.URL.indexOf(docsFolderName + "web/") > 0)) {
                                flag = true
                                if ($(fullTreeATags[i]).hasClass("refreshLink")) {
                                    $(fullTreeATags[i]).trigger("click")
                                } else {
                                    RequestNewPage(fullTreeATags[i], paramLink, needh3, null, onlyLoadContent)
                                }
                            }
                        }
                        if (!ifOtherLangTag && !flag) {
                            flag = true
                            if ($(fullTreeATags[i]).hasClass("refreshLink")) {
                                $(fullTreeATags[i]).trigger("click")
                            } else {
                                RequestNewPage(fullTreeATags[i], paramLink, needh3, null, onlyLoadContent)
                            }
                        }
                    }
                } else if (searchHref.toLowerCase() == targetHref && (fullTreeATags[i]).hasClass("refreshLink")) {
                    flag = true
                    $(fullTreeATags[i]).trigger("click")
                }
            }
            
        }
        if (!flag) {
            // use modal to display page if not in the menu tree
            if (document.URL.indexOf("/mobile-web-capture/docs/") > 0 || document.URL.indexOf("/document-viewer/docs/") > 0) {
                window.open(paramLink)
            } else {
                window.open(aTag.href)
                //showPageContentInModal(paramLink)
            }
        }
    }
}
// #endregion

// #region changeVersion
async function changeVersion(liTag)
{
    console.log("changeVersion", liTag)
    var curUrl = document.URL;

	var innertext = (liTag.innerText).toLowerCase();
	var ver = null;
	if (innertext.indexOf("latest version")>=0){
		ver = "latest"
	} else {
		ver = innertext.replace('version ','');
	}
	
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

    let pageNotFoundLink = location.origin + getDocumentationLink(productVar || getCurrentUrlProductName(), langVar || getCurrentUrlLang(document.URL, true), document.URL)
    
    if ($(liTag).hasClass("latestVer")) {
        curUrl = curUrl.replace(/\/index-v[0-9]+\.[0-9]+\.[0-9]+[^\/]*\.html/g, "/");
        curUrl = curUrl.replace(/-v[0-9]+\.[0-9]+\.[0-9]+[^\/]*\.html/g, ".html");
        curUrl = curUrl.replace(/-v[0-9]+\.[0-9]+\.[0-9]+[^\/]*\//g, "/");
        curUrl = curUrl.replace(docsFolderName, "/docs/")
        pageNotFoundLink = pageNotFoundLink.replace(docsFolderName, "/docs/")
        if (productVar != undefined) {
            curUrl = `${curUrl}${curUrl.indexOf('?')>0?'&':'?'}product=${productVar}`
        }
        if (langVar != undefined) {
            curUrl = `${curUrl}${curUrl.indexOf('?')>0?'&':'?'}lang==${langVar}`
        }
        if (srcVal != undefined) {
            curUrl = `${curUrl}${curUrl.indexOf('?')>0?'&':'?'}src==${srcVal}`
        }
        if (anchorVar != undefined) {
            curUrl = curUrl + "#" + anchorVar;
        }
        goToValidateLink(curUrl, pageNotFoundLink);
        return
    }

    // dbr 历史版本引用 dcv-docs--- dcv/docs-archive？product=dbr 跳转 latest 版本
    if (curUrl.indexOf("docs-archive") > 0 && productVar == "dbr" && ver == "latest") {
        curUrl = curUrl.replace("/docs-archive/", docsFolderName)
        window.location.href = curUrl + "?product=dbr&lang=" + langVar + (anchorVar != undefined ? "#" + anchorVar  : "")
        return
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
    
    var latestVersion = getProductLangLatestVersion(productVar || getCurrentUrlProductName(document.URL), getCurrentUrlLang(document.URL, true))
    if (ver != 'latest' && ver != latestVersion) {
        curUrl = curUrl + "?ver=" + ver + "&cVer=true";
        pageNotFoundLink = pageNotFoundLink + "?ver=" + ver + "&cVer=true";
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

    // dcv/docs/xxx?product=dbr 跳转到 历史版本
    if (productVar == "dbr" && productVar && getCurrentUrlProductName() != productVar) {
        let changeVersionMatch = findVersionMatchItemInSearchList(productVersion, langVar)
        if (changeVersionMatch && !changeVersionMatch.matchVersion) {
            curUrl = curUrl.replace(docsFolderName, "/docs-archive/")
        }
    }
    goToValidateLink(curUrl, pageNotFoundLink);
	// window.location.href = curUrl;
	return;
}

async function goToValidateLink(curUrl, pageNotFoundLink) {
  const response = await fetch(curUrl);
  if (!response.ok || response.status !== 200) {
    window.location.href = pageNotFoundLink
    return;
  }
  const data = await response.text();
  const parser = new DOMParser();
  const pageDoc = parser.parseFromString(data, "text/html");
  if (pageDoc.querySelector("#pageNotFound")) {
    window.location.href = pageNotFoundLink;
  } else {
    window.location.href = curUrl;
  }
}
// #endregion

// #region initHistoryVersionList
async function initHistoryVersionList(ver) {
    // ddn,dcp,dlr,dce --- get dcv history versions
    let product = getUrlVars(document.URL)["product"] || getCurrentUrlProductName(document.URL)
    let lang = getCurrentUrlLang(document.URL, true)
    let treePageLink = getSideBarIframeSrc(document.URL, lang, product)
    treePageLink = treePageLink || sideBarIframeSrc

    return new Promise((resolve, reject) => {
        fetch(treePageLink, { cache: "no-cache" }).then(function (response) {
            return response.text()
        }).then(function (data) {
            resolve(data)
        })
    }).then(function (data) {
        const parser = new DOMParser()
        FullTreePageDoc = parser.parseFromString(data, 'text/html')
        var historyVersion = FullTreePageDoc.querySelector('.fullVersionHistory');
        if ($(historyVersion) && $(historyVersion).length > 0) {
            $("#categoryMenuTree_history .fullVersionHistory").html($(historyVersion).html());
        }
        initHistoryVersionList_Detail(ver)
    }).catch(function (error) {
        initHistoryVersionList_Detail(ver)
    })
}

function initHistoryVersionList_Detail(ver) {
    let productName = getUrlVars(document.URL)["product"] || getCurrentUrlProductName(document.URL)
    let lang = getCurrentUrlLang(document.URL, true)
    if (lang == 'objectivec-swift') {
        lang = 'ios'
    }
    if (lang == 'react-native') {
        lang = 'reactNative'
    }
    var productLatestVersion = getProductLangLatestVersion(productName, lang)
    let obj = $(".fullVersionInfo li")
    for (var i=0; i<obj.length; i++) {
        let edition = $(obj[i]).data("editions")
        if (edition && edition != "" && edition.split('_').indexOf(lang) < 0) {
            $(obj[i]).addClass("hideLi").hide()
        }
        if ($(obj[i]).text().toLowerCase() == "version " + productLatestVersion) {
            //$(obj[i]).addClass("hideSameVerAsLatestLi").hide()
            $(obj[i]).addClass("sameVerAsLatestLi")
        }
    }
    let obj2 = $(".fullVersionInfo .hasChildLi")
    for (var i=0; i<obj2.length; i++) {
        var childItem = $(obj2[i]).find("> ul > li:not(.hideLi)")
        if (childItem.length == 0) {
            $(obj2[i]).addClass("hideLi").hide()
        }
    }

    var firstItem = $(".fullVersionInfo li:not(.hideLi)").eq(0)
    if (firstItem.text().toLowerCase() == "latest version") {
        var latestVersion = getProductLangLatestVersion(productName, lang == "" ? "core" : lang)
        latestVersion != undefined && firstItem.text("Latest Version (" + latestVersion + ")")
        $(".currentVersion").text("Latest Version");
    } else {
        var latestVersion = getProductLangLatestVersion(productName, lang == "" ? "core" : lang, true)
        let latestLi = $("<li class='latestVer' onclick='changeVersion(this)'>").text("Latest Version (" + latestVersion + ")");
        $(".fullVersionInfo").prepend(latestLi);
        $(".currentVersion").text("Version "+ findNearestVersion(ver));
    }
}
// #endregion

// #region getRequestNewPageVersion
function getRequestNewPageVersion(linkUrl) {
    var curVersion = getUrlVars(linkUrl)["ver"]
    curVersion = curVersion==undefined ? "latest" : curVersion
    var queryProduct = getUrlVars(linkUrl)["product"]
    var queryLang = getUrlVars(linkUrl)["lang"]
    if (queryProduct == undefined) {
        // same product
        if (queryLang == undefined || linkUrl.indexOf("/core/") < 0) { // same product, same language
            return curVersion
        } else { // same product, lang to core
            if (curVersion == "latest") {
                var searchLang = queryLang
                var productName = getCurrentUrlProductName(linkUrl)
                var langLV = getProductLangLatestVersion(DcvProducts.indexOf(productName)>=0 ? "dcv" : productName, searchLang)
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
        var returnVersion = getLinkVersion(curVersion, linkUrl, product, lang ? lang : 'core', getCurrentUrlProductName(linkUrl))
        return returnVersion == -1 ? curVersion : returnVersion
    }
}
// #endregion

// #region getLinkVersion
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
 * getLinkVersion("2.0.20", document.URL, "ddn", "javascript", "dcv")
 * getLinkVersion("10.0.10", null, "dbr", "cpp", "dlr")
 * getLinkVersion("10.0.10", null, "dbr", "core", "dlr")
 * getLinkVersion("10.0.10", "https://www.dynamsoft.com/capture-vision/docs/core/enums/utility/region-predetection.html", "dbr", "core", "dcv")
 * getLinkVersion("10.0.10", "https://www.dynamsoft.com/capture-vision/docs/core/enums/utility/region-predetection.html", "dbr", "cpp", "dcv")
 * getLinkVersion('2.2.3000', 'https://officecn.dynamsoft.com:808/barcode-reader/docs/web/programming/javascript/user-guide/index.html?product=dcv&lang=javascript', 'dcv', 'javascript', 'dbr') 
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
    lang = lang == "js" || lang == "javascript" ? "javascript" : lang

    // 找到对应的 matchList
    if (dcvVersionList) {
        let isFindInMatchVersion = false
        let filteredItems = dcvVersionList.filter(function(item) {
            //let productVersion = item[product+'Core']
            let productVersion = item.version
            let isReturn = false
            let matchItems = null
            if (productVersion && getFormatVal(productVersion) <= getFormatVal(curVersion)) {
                if (item.matchVersion) {
                    for(let matchItem in item.matchVersion) {
                        matchItem = matchItem == "js" || matchItem == "javascript" ? "javascript" : matchItem
                        if (matchItem == lang) {
                            isReturn = true
                            isFindInMatchVersion = true
                            item.matchItems = item.matchVersion[matchItem]
                        }
                    }
                } else {
                    for(let matchItem in item.matchList) {
                        matchItem = matchItem == "js" || matchItem == "javascript" ? "js" : matchItem
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
                                        var linkUrlReop = titleCase(getCurrentUrlRepoType(linkUrl))
                                        var dcvRepoName = "dcvRepo" + linkUrlReop
                                        if (subMatchItems == dcvRepoName) {
                                            matchItems = tempMatchItems[subMatchItems]
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
                                var linkUrlReop = titleCase(getCurrentUrlRepoType(linkUrl))
                                var dcvRepoName = "dcvRepo" + linkUrlReop
                                if (matchItem == dcvRepoName) {
                                    matchItems = item.matchList[matchItem]
                                    isReturn = true
                                }
                            }
                        }
                    }
                    item.matchItems = matchItems
                }
            }

            item.productVersion = productVersion
            return isReturn
        })

        if (filteredItems && filteredItems.length > 0) {
            filteredItems.sort(function(a, b) {
                return getFormatVal(b.productVersion) - getFormatVal(a.productVersion)
            })
            var findMatchItems = filteredItems[0]["matchItems"]
            if (linkProduct != "dcv" || isFindInMatchVersion) {
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
    } else {
        return -1
    }
}
// #endregion

// #region getDCVLangVersion
// getDCVLangVersion('flutter', '10.0.0')
function getDCVLangVersion(linkLang, curVersion) {
    let filteredItems = dcvVersionList.filter(function(item){
        let productVersion = item.version
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
        item.productVersion = productVersion
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
// #endregion

window.addEventListener("popstate", function(e) {
    findCurLinkOnFullTree({href: location.href}, location.href, true, true, true)
}, false)