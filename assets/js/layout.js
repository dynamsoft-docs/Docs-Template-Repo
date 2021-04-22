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
        if ($('.docContainer').height() + menuHeight >= document.body.clientHeight) {
            $('.history').addClass('history-fixed');
            $('#footerWrapper').css({'margin-top': '48px'});
        }
        $('.docContainer .markdown-body').css({'margin-top': ($('#docHead').outerHeight() + 0) + 'px'});
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
                $('.sideBar').css({'padding-top': '0px'});
                $('.sideBar #sideBarCnt').addClass('sidebar-fixed');
                $('.rightSideMenu').addClass('rsm-fixed');
                if (dcHeight + 48 > clientHeight) {
                    // history fixed
                    $('.history').addClass('history-fixed');
                    $('#footerWrapper').css({'margin-top': '48px'});
                } else {
                    $('.history').removeClass('history-fixed');
                    $('#footerWrapper').css({'margin-top': '0px'});
                }
            } else {
                // head and sidebar fixed
                if ($('.subHeadWrapper').length > 0) {
                    $('.subHeadWrapper').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.subHeadWrapper').height() + 'px'});
                } else {
                    $('.productMenu').css({'top': ($('#overall-header').height()-sd) + 'px'});
                    $('.sideBar').css({'padding-top': $('.productMenu').height() + 'px'});
                }
                $('#docHead').css({'top': (menuHeight-sd)+1 + 'px'});
                $('.sideBar #sideBarCnt').removeClass('sidebar-fixed');
                $('.rightSideMenu').removeClass('rsm-fixed');

                // history fixed
                if (sd < $('#overall-header').height() && dcHeight + 48 > clientHeight) {
                    if (!$('.history').hasClass('history-fixed')) {
                        $('.history').addClass('history-fixed');
                        $('#footerWrapper').css({'margin-top': '48px'});
                    }
                } else {
                    $('.history').removeClass('history-fixed');
                    $('#footerWrapper').css({'margin-top': '0px'});
                }
            }
        } else {
            $('.subHeadWrapper').css({'top': 'unset'});
            $('.productMenu').css({'top': 'unset'});
            $('#docHead').css({'top': 'unset'});
            $('.sideBar').css({'padding-top': '20px'});
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

    var commBtnInterval = setInterval(function() {
        if ($('#comm100-float-button-2').css('background') != undefined && $('#comm100-float-button-2').css('background')!='') {
            if ($('#comm100-float-button-2').css('background').indexOf('imgId=5000315') >= 0) {
                $('#comm100-float-button-2').addClass('online');
            } 
            if ($('#comm100-float-button-2').css('background').indexOf('imgId=5000316') >= 0) {
                $('#comm100-float-button-2').addClass('offline');
            }
            clearInterval(commBtnInterval)
        }
    }, 1000);
})