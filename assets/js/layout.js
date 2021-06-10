$(document).ready(function(){ 
    init();

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
        $('.rightSideMenu').css({'height': 'calc(100vh - '+(menuHeight + 195)+'px)'});
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
                } else {
                    $('.productMenu').css({'top': '0px'});
                    $('#docHead').css({'top': ($('.productMenu').height()) + 'px'});
                }
                // $('.sideBar').css({'padding-top': '0px'});
                $('.sideBar #sideBarCnt').addClass('sidebar-fixed');
                $('.rightSideMenu').addClass('rsm-fixed');
                $('.history').css({'top': '119px'})
            } else {
                // head and sidebar fixed
                if ($('.subHeadWrapper').length > 0) {
                    $('.subHeadWrapper').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.subHeadWrapper').height() + 42 + 'px!important'});
                } else {
                    $('.productMenu').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.productMenu').height() + 42 + 'px!important'});
                }
                $('#docHead').css({'top': (menuHeight-sd)+1 + 'px'});
                $('.sideBar #sideBarCnt').removeClass('sidebar-fixed');
                $('.rightSideMenu').removeClass('rsm-fixed');

                // history fixed
                $('.history').css({'top': ($('#overall-header').height() + $('.productMenu').height() + 30 +  - sd) + 'px'})
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
})