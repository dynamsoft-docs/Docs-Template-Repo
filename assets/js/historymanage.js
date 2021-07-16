function UrlReplace()
{
    var docUrl = document.URL;    
    var ver = getUrlVars(docUrl)["ver"];
    var matchVer = getUrlVars(docUrl)["matchVer"];
    if (matchVer == undefined && ver != undefined) {
        RedirToGivenVersionPage(ver);
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
        var verText = (curVerTag[0].innerText).toLowerCase();
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
                        window.location.replace(aTag[0].href + "&&ver=" +inputVer+"&&matchVer=true");
                        return;
                    }
                    else{
                    	if (getUrlVars(document.URL)["src"] != undefined){
                    		window.location.replace(aTag[0].href + "?src=" + getUrlVars(document.URL)["src"] + "&&ver=" +inputVer+"&&matchVer=true" + anchorVal);
                    	}
                    	else{
                        	window.location.replace(aTag[0].href + "?ver=" +inputVer+"&&matchVer=true" + anchorVal);
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
                window.location.replace(aTag[0].href + "&&ver=" +inputVer+"&&matchVer=true");
                return;
            }
            else{
                if (getUrlVars(document.URL)["src"] != undefined){
                    window.location.replace(aTag[0].href + "?src="+ getUrlVars(document.URL)["src"] + "&&ver=" +inputVer+"&&matchVer=true");
                }
                else{
                    window.location.replace(aTag[0].href + "?ver=" +inputVer+"&&matchVer=true");
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

function addParam (aTag, verText)
{
    var hrefVal = aTag.href;

    if(hrefVal == "")
        return;

    var exp = new RegExp(/[?&]ver=[^&^#]+/gi);
	if (exp.exec(hrefVal) != null){
        if (aTag.target == '_blank') {
            window.open(hrefVal)
        } else {
            window.location.href = hrefVal;
        }
		return;
	}
	
	var verStr = "";
	exp = new RegExp(/[?]+([^=]+)=/gi)
        if (exp.exec(hrefVal) != null){
		verStr = "&&ver=" + verText;
	}
	else{
		verStr = "?ver=" + verText;
	}
	
	if (hrefVal.indexOf("#") != -1){
		var urlAry = hrefVal.split("#");
		if (urlAry.length == 2){
            if (aTag.target == '_blank') {
                window.open(urlAry[0]+verStr+"#"+urlAry[1])
            } else {
                window.location.href = urlAry[0]+verStr+"#"+urlAry[1];
            }
			return;
		}
	}
	else{
        if (aTag.target == '_blank') {
		    window.open(hrefVal+verStr);
        } else {
            window.location.href = hrefVal+verStr;
        }
		return;
	}
	
	return;
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
	
	curUrl = curUrl + "?ver=" + ver;
	if (srcVal != undefined){
		curUrl = curUrl + "&&src=" + srcVal;
	}
	if(anchorVar != undefined){
		curUrl = curUrl + "#" + anchorVar;
	}
	window.location.href = curUrl;
	return;
}
