function FullTreeMenuList(generateDocHead, needh3=true) {
  var allHerf1 = $(".docContainer .content, #docHead, #AutoGenerateSidebar, .sideBar, #crumbs").find("a");
  for (var i = 0; i < allHerf1.length; i++) {
      allHerf1[i].onclick = function(){
        if ($(this).parents(".sideBar").length > 0) {
          addParam(this, null, 'sidebar'); 
        } else {
          addParam(this, null); 
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
  if ($('#' + searchListId).find('.activeLink').parent()[0].dataset.ishashnode) {
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