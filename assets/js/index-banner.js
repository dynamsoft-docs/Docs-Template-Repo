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
    }
}

function FullTreeMenuList(generateDocHead, needh3 = true) {
    var navWrap = document.getElementById("fullTreeMenuListContainer");
    if (navWrap != null) {
        HighlightCurrentListForFullTree("fullTreeMenuListContainer", true, document.URL, generateDocHead);
        if (generateDocHead) {
            GenerateContentByHead(needh3);
            //GenerateContentByHead(false);
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

function HighlightCurrentListForFullTree(searchListId, firstTime, searchUrl = document.URL, needGenerateDocHead = false) {
    var navWrap = document.getElementById(searchListId);
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
        var foundCurList = false;
        var bestMatchList = -1;

        for (var i = 0, len = listAry.length; i < len; i++) {
            var curLi = listAry[i];
            var curListATag =  $(curLi).children("a");
            if (curListATag.length > 0 && curListATag[0].getAttribute("href") != null) {
                var returnVal = UrlSearch(searchUrl, curListATag[0].href);
                if (returnVal == 1) {
                    bestMatchList = i;
                    break;               
                }
                else {
                    if (returnVal == 0) {
                        bestMatchList = i;
                    }
                    
                    if (!firstTime) {
                        curListATag[0].style.fontWeight = 'normal';
                    }
                }
            }
        }

        if (bestMatchList != -1) {
            var curLi = listAry[bestMatchList];
            var curListATag =  $(curLi).children("a");

            foundCurList = true;
            curListATag[0].style.color = '#fe8e14';
            curListATag[0].className = "otherLinkColour activeLink"

            if (firstTime) {
                var crumbul = $($('#crumbs')).children("ul")
                if (crumbul.length != 0) {
                    var parentsLi = $(curLi).parents("li");
                    var appendText = "";
                    if (parentsLi.length > 0) {
                        for (var j = parentsLi.length - 1; j >= 0 ; j--) {
                            var tmpATag = $(parentsLi[j]).children("a");
                            if (tmpATag.length > 0) {
                                appendText += '<li><a class="bluelink" href = "' + tmpATag[0].href + '">'+ tmpATag[0].textContent + '</a></li>';
                            }
                        }
                    }

                    var childUl = $(curLi).children("ul");
                    if (childUl.length > 0) {
                        appendText += '<li><a class="bluelink" href = "' + curListATag[0].href + '">'+ curListATag[0].textContent + '</a></li>';
                    }
                    else {
                        appendText += '<li id="breadcrumbLastNode">' + curListATag[0].textContent + '</li>'
                    }
                    $(crumbul[0]).append(appendText);
                }
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
                                // curULChildrenListAry[k].style.listStyleImage = "url('/assets/img-icon/collapse-list.png')";  
                            }
                            else {
                                curULChildrenListAry[k].className = "expandListStyle"
                                // curULChildrenListAry[k].style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                            }
                        }
                    }
                }

                var childUL = $(curLi).children("ul");
                if (childUL.length > 0) {
                    curLi.className = "expandListStyle"
                    // curLi.style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                    if (childUL[0].style.display != "block") {
                        childUL[0].style.display = "block";
                    }
                    curListATag[0].removeAttribute("href");

                    var childrenLi = $(childUL[0]).children("li");
                    for (var j = 0; j < childrenLi.length; j++) {
                        var curULTag = $(childrenLi[j]).children("ul");
                        if (curULTag.length > 0) {
                            if (curULTag[0].style.display != "block") {
                                childrenLi[j].className = "collapseListStyle"
                                // childrenLi[j].style.listStyleImage = "url('/assets/img-icon/collapse-list.png')";  
                            }
                            else {
                                childrenLi[j].className = "expandListStyle"
                                // childrenLi[j].style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                            }
                        }
                    }
                }
                var parentsLi = $(curLi).parents("li");
                for (var j = 0, lenLi = parentsLi.length; j < lenLi; j++) {
                    parentsLi[j].className = "expandListStyle"
                    // parentsLi[j].style.listStyleImage = "url('/assets/img-icon/expand-list.png')";
                }
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
            return 1;
        }
        else if (docUrlAnchor != undefined && listUrlAnchor == undefined) {
            return 0;
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
