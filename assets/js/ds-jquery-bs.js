$(function(){
	// DBR Nav JS
	$('.showMenuMore').on('click', function () {
		if ($(this).hasClass('on')) {
				$('.showMenuMore').removeClass('on');
				$('.ct-more').slideUp();
		} else {
				$('.showMenuMore').removeClass('on');
				$(this).addClass('on');
				$('.ct-more').slideUp();
				$(this).parent().find('.ct-more').slideDown();
		}
	});
	
	/*smSearch*/
	$('.mobileProductMenu .productLogo').on('click', function () {
		$('.mobileProductDetailMenu').slideToggle(300);
	})
	
	$(document).click(function(){
		$('.mobileProductDetailMenu').slideUp();
		$('.ct-more').slideUp().removeClass('on');
		$('.showMenuMore').removeClass('on');
	});

	$(".showMenuMore, .mobileProductMenu .productLogo, .mobileProductDetailMenu").bind('click', function (e) {
		stopPropagation(e);
	});
	
});

/*event bubble*/
function stopPropagation(e) {
	if (e.stopPropagation)
		e.stopPropagation();
	else
		e.cancelBubble = true;
}

function breakpoint(){
	var type;
	if($("#xsHeader").css('display')=='block'){
		type='xs';
		}else if($("#smHeader").css('display')=='block'){
			type='sm';
			}else if($("#mdHeader").css('display')=='block'){
				if($("#mdHeader .container").outerWidth()=='970'){
					type='md';
					}else{
						type='lg';
						}
				}
	return type;
}