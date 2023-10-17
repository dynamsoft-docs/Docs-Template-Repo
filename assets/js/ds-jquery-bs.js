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