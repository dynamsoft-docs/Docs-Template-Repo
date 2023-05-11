function FullTreeMenuList(generateDocHead, needh3=true) {
  var allHerf1 = $(".docContainer .content, #docHead, #AutoGenerateSidebar, .sideBar, #crumbs").find("a");
  for (var i = 0; i < allHerf1.length; i++) {
      var verArray = getUrlVars(document.URL)
      allHerf1[i].onclick = function(){
        if (!$(this).hasClass("refreshLink") && $(this).parents(".sideBar").length > 0 && $("#articleContent").length > 0) {
          addParam(this, 'sidebar', needh3); 
        } else if (!$(this).hasClass("refreshLink") && $(this).parents(".markdown-body").length > 0 && $("#articleContent").length > 0) {
            addParam(this, 'docContainer', needh3); 
        } else {
          addParam(this); 
        }
        return false;
      };
  }
  var navWrap = document.getElementById("fullTreeMenuListContainer");
  if (navWrap != null) {
    AddCanonicalLinkOnPage(document.URL);
    ExpandCurrentPageTree("fullTreeMenuListContainer");
    initCrumbs()
    generateDocHead = generateDocHead == true || generateDocHead == 'true' ? true : false
    if (generateDocHead) {
      needh3 = needh3 == 'true' || needh3 == true ? true : false
      if (needh3) {
          $('#fullTreeMenuListContainer').addClass('needh3');
      }              
      GenerateContentByHead(needh3);
    }
    // multi panel switching start
    let multiPanelListSwitchingItems = $(".multi-panel-switching-prefix")
    for (let i =0; i < multiPanelListSwitchingItems.length; i++) {
        let multiPanelSwitchBtns = $(multiPanelListSwitchingItems[i]).find("+ul > li")
        let hash = location.hash
        let switchIndex = 0
        if (hash && hash != "") {
            for(let j=0; j < multiPanelSwitchBtns.length; j++) {
                if ($(multiPanelSwitchBtns[j]).find("a").attr("href") == hash) {
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
  }
}

function AddCanonicalLinkOnPage(searchUrl = document.URL) { 
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
}

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

function ExpandCurrentPageTree(searchListId) {
  $('#' + searchListId).find('.activeLink').parent().parents("li").removeClass("collapseListStyle").addClass("expandListStyle")
  if ($('#' + searchListId).find('.activeLink').parent().length > 0 && $('#' + searchListId).find('.activeLink').parent()[0].dataset.ishashnode) {
    var activeLinkItem = $('#' + searchListId).find('.activeLink')
    var urlItems = $(activeLinkItem).parent().find("a")
    if (document.URL.indexOf("#") > 0) {
      var hashItem = location.hash
      var compareLink = document.URL.split("?")[0] + hashItem
      for(var i=0; i<urlItems.length; i++) {
        if (urlItems[i].href==compareLink) {
          $(urlItems[i]).addClass("activeLink")
          $(activeLinkItem).addClass("childHashItemsLink")
        }
      }
    }
    $(urlItems).on('click', function() {
      $(urlItems).removeClass("activeLink")
      $(this).addClass("activeLink")
    })
  }
  if (document.URL.indexOf("/docs/faq/") > 0 && document.URL.indexOf(".html") > 0) {
    $('#' + searchListId).find(">li:last-child").removeClass("collapseListStyle").addClass("expandListStyle")
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
      if (document.URL.indexOf("/docs/faq/") > 0 && document.URL.indexOf(".html") > 0) {
        appendText += '<li><a class="bluelink" href = "https://www.dynamsoft.com/web-twain/docs/faq/">FAQ</a></li>'
      }
      $(crumbul[0]).append(appendText);
  }
}

function showSelectMultiPanel(nextSiblings, findItemIndex) {
  let isFind = false, findItemCount = 0, aTags = [], isFindTag = false, findTagName = 'h2';
  for(let j = 0; j < nextSiblings.length; j++) {
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
          if($(nextSiblings[j]).is("table")) {
            let objs = $(nextSiblings[j]).find("a")
            for(let i = 0; i < objs.length; i++) {
              aTags.push($(objs[i]).attr("href"))
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
  let sidebarList = $("#AutoGenerateSidebar> ul > li")
  for(let i=0; i < sidebarList.length; i++) {
    let aTag = $(sidebarList[i]).find("a").attr("href")
    if (aTags.includes(aTag)) {
      $(sidebarList[i]).show()
    } else {
      $(sidebarList[i]).hide()
    }
  }
}