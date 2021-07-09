$(document).ready(function(){ 
    init();
    $('.markdown-body .sample-code-prefix + blockquote > ul > li:first-child').addClass('on')
    $('.markdown-body .sample-code-prefix + blockquote > ol > li:first-child').addClass('on')

    var sd = $(window).scrollTop()
    if(sd > 0) {
        realFunc()
    }

    $(window).resize(function() {
        init()
        realFunc()
    })

    window.addEventListener('scroll', realFunc);

    function init() {
        var subHeight = 0;
        if ($('.subHeadWrapper').length > 0) {
            subHeight = $('.subHeadWrapper').height();
        } else {
            subHeight = $('.productMenu').height();
        }
        var menuHeight = $('#overall-header').height() + subHeight;
        $('#sideBarCnt').css({'width': $('.sideBar').width() + 'px'});
        $('.container .head').css({'width': $('.docContainer').width() + 'px'});
        $('#fullTreeMenuListContainer').css({'height': 'calc(100vh - '+(menuHeight + 120) +'px)'});
        $('.rightSideMenu').css({'height': 'calc(100vh - '+ (menuHeight)+'px)'});
        $('.rightSideMenu').css({'padding-top': $('#docHead').outerHeight()+'px'});
        $('.docContainer .markdown-body').css({'margin-top': ($('#docHead').outerHeight() + 0) + 'px'});
        if (breakpoint() == 'lg') {
            $('.history').css({'width': $('#txtSearch').outerWidth() + 'px'});
            $('.history').removeClass('history-absolute');
        } else {
            $('.history').css({'width': '200px'});
            $('.history').addClass('history-absolute');
        }
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
            }
        }
        
    }

    function realFunc() {
        $('.rightSideMenu').css({'padding-top': $('#docHead').outerHeight()+'px'});
        if (breakpoint() == 'lg') {
            var subHeight = 0;
            if ($('.subHeadWrapper').length > 0) {
                subHeight = $('.subHeadWrapper').height();
            } else {
                subHeight = $('.productMenu').height();
            }
            var menuHeight = $('#overall-header').height() + subHeight;
            var sd = $(window).scrollTop();
            var dcHeight = $('.docContainer').height() + menuHeight - sd;
            var clientHeight = document.body.clientHeight;
            if (sd >= $('#overall-header').height()) {
                // head and sidebar fixed
                if ($('.subHeadWrapper').length > 0) {
                    $('.subHeadWrapper').css({'top': '0px'});
                    $('#docHead').css({'top': ($('.subHeadWrapper').height() + 1) + 'px'});
                    $('.history').css({'top': '119px'})
                } else if ($('.productMenu').length > 0) {
                    $('.productMenu').css({'top': '0px'});
                    $('#docHead').css({'top': ($('.productMenu').height()) + 'px'});
                    $('.history').css({'top': '119px'})
                } else {
                    $('#docHead').css({'top': '0px'});
                    $('.history').css({'top': '30px'})
                }
                $('.sideBar #sideBarCnt').addClass('sidebar-fixed');
                $('.rightSideMenu').addClass('rsm-fixed');
            } else {
                // head and sidebar fixed
                if ($('.subHeadWrapper').length > 0) {
                    $('.subHeadWrapper').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.subHeadWrapper').height() + 42 + 'px!important'});
                    $('.history').css({'top': ($('#overall-header').height() + $('.subHeadWrapper').height() + 30 +  - sd) + 'px'})
                } else if ($('.productMenu').length > 0) {
                    $('.productMenu').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.productMenu').height() + 42 + 'px!important'});
                    $('.history').css({'top': ($('#overall-header').height() + $('.productMenu').height() + 30 +  - sd) + 'px'})
                } else {
                    $('.sideBar').css({'padding-top':  + '42px!important'});
                    $('.history').css({'top': ($('#overall-header').height() + 30 +  - sd) + 'px'})
                }
                $('#docHead').css({'top': (menuHeight-sd)+1 + 'px'});
                $('.sideBar #sideBarCnt').removeClass('sidebar-fixed');
                $('.rightSideMenu').removeClass('rsm-fixed');
            }
        } else {
            $('.subHeadWrapper').css({'top': 'unset'});
            $('.productMenu').css({'top': 'unset'});
            $('#docHead').css({'top': 'unset'});
            $('.sideBar').css({'padding-top': '20px!important'});
        }
    }

    $('.sideBarIcon').click(function() {
        $(".sideBar").toggleClass('hide-sm');
        $(".sideBar").toggleClass('hide-xs');
        setTimeout(function() {
            $('#sideBarCnt').css({'width': $('.sideBar').width() + 'px'});
        }, 100)
    })

    $(document).click(function(){
        $('.otherVersions').hide();
        $('.fullVersionInfo').hide();
    })

    $('.changeBtn').on('click', function(e) {
        $('.otherVersions').toggle();
        stopPropagation(e);
    })

    $('.fvChange').on('click', function(e) {
        $('.fullVersionInfo').toggle();
        stopPropagation(e);
    })

    $('.history .currentVersion').on('click', function(e) {
        $('.fullVersionInfo').slideToggle();
        stopPropagation(e);
    })

    $('.markdown-body .sample-code-prefix + blockquote ul li').on('click', function() {
        var index = $(this).index()
        var sIndex = $($(this).parent().parent()[0].previousSibling.previousSibling).index('.sample-code-prefix')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ul li').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ol li').removeClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ul li').eq(index).addClass('on')
        $('.markdown-body .sample-code-prefix').eq(sIndex).find('+ blockquote ol li').eq(index).addClass('on')
    })

    $('.markdown-body .sample-code-prefix + blockquote ol li a').on('click', function() {
        copy($(this).parent().find('code').text())
    })

    $('.copy-prefix + p a').on('click', function() {
        copy($(this).parent().find('+ div code').text())
    })
})

function copy(data) {
    let url = data;
    let oInput = document.createElement('textarea')
    oInput.value = url
    document.body.appendChild(oInput)
    oInput.select()
    document.execCommand("Copy");
    oInput.remove()
}