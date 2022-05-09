function FullTreeMenuList(generateDocHead) {
  var verArray = SearchVersion();
  var allHerf1 = $(".docContainer .content, #docHead, #AutoGenerateSidebar, .sideBar, #crumbs").find("a");
  for (var i = 0; i < allHerf1.length; i++)
  {
      allHerf1[i].onclick = function(){addParam(this, verArray[0]); return false;};
  }
  var navWrap = document.getElementById("fullTreeMenuListContainer");
  if (navWrap != null) {
    AddCanonicalLinkOnPage(document.URL);
    FilterCurrentVersionTree($("#fullTreeMenuListContainer > li"), verArray[0]);
    var curLiItem = $('#fullTreeMenuListContainer').find('.activeLink').parent()
    if (curLiItem.length > 0 && !isPageInVersionTree(curLiItem[0], verArray[0])) {
      var replaceUrl = document.URL
      if ($(curLiItem[0]).parent().hasClass("mainPage")) {
        replaceUrl = $('#fullTreeMenuListContainer > li').not(".notCurVersionItem").find("a")[0].href
      } else {
        replaceUrl = $(curLiItem[0]).parent().parent().find("a").not(".activeLink")[0].href
      }
      window.location.replace(replaceUrl)
    }
    ExpandCurrentPageTree("fullTreeMenuListContainer");
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

function isPageInVersionTree(treeItem, curVersion) {
  var startVersion = treeItem.dataset.startversion || "0", endVersion = treeItem.dataset.endversion  || null;
  var startDiff = GetVersionDiff(startVersion, curVersion)
  var endDiff = endVersion && endVersion!="" ? GetVersionDiff(curVersion, endVersion) : 100

  if (startDiff <= 0 || endDiff == -1) {
    return false
  } else {
    return true
  }
}

function FilterCurrentVersionTree(treeList, curVersion) {
  for(var i=0; i<treeList.length; i++) {
    var treeItem = treeList[i];
    if (!isPageInVersionTree(treeItem, curVersion)) {
      $(treeItem).addClass('notCurVersionItem')
      $(treeItem).find("a").removeClass("activeLink")
    } else {
      if ($(treeItem).find('ul').length > 0) {
        FilterCurrentVersionTree($(treeItem).find('ul > li'), curVersion)
      }
    }
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

function SearchVersion() {
  var docUrl = document.URL;    
  var ver = getUrlVars(docUrl)["ver"];
  var curVerFromUrl = "";
  var tmpExp = new RegExp(/-v[0-9]+[^\/^?^#]*((\/)|(.html))/g);
  var searchAry = tmpExp.exec(docUrl);
  if (searchAry != null){
      curVerFromUrl = searchAry[0].replace('-v','');
      curVerFromUrl = curVerFromUrl.replace('.html','');
      curVerFromUrl = curVerFromUrl.replace('/', '');
  }
  else{
      curVerFromUrl = "latest"
  }

  var compatiableDiv = document.getElementById( "compatibleInfo");
  if (ver == undefined){
      ver = curVerFromUrl;
      if(compatiableDiv != null){
          compatiableDiv.style.display = "none";
      }
  }
  else if (ver != curVerFromUrl){
      var curVerTag = $(".currentVersion ");
      var compatibleTag = $(".compatibleCurVersion")
      if (curVerTag != null) {
          if (ver == "latest"){
              curVerTag[0].innerText = "latest version";
          }
          else{
              curVerTag[0].innerText = "version "+ver;
          }
      }
      if(compatiableDiv != null){
          
      }
      if (compatiableDiv != null && compatibleTag != null){
          compatiableDiv.style.display = "block";
          compatibleTag[0].innerText = "Version "+ver;
      }
      else if (compatiableDiv != null){
          compatiableDiv.style.display = "none";
      }
  }
  else if (compatiableDiv != null){
      compatiableDiv.style.display = "none";
  }

  var verArray = new Array(ver, curVerFromUrl);
  return verArray;
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