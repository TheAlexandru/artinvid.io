const container = $('.container');
$(document).ready(function(){
      var win = $(this); 
      if (win.width() <= 799) { mobile()  }
      if (win.width() > 800) { desktop() }
});


function desktop(){
//#### Load tabs ####
	newTab('subs');// On first load show subs
	function loadSubs(){
		container.html(
			$('<div>').addClass('col-xs-6 search').html(
				$('<input>').attr({type:'text',placeholder:'Search'}).addClass('form-control')
			).append( $('<div>').addClass('search_btn') )
		)
	}

	function loadSettings(){
		alert('clicked settings');
	}

	function loadProfile(){
		$(container).html(
			$('<button>').attr('id','execute-request-button').html('Login')
		)
		handleClientLoad();
	}

	function newTab(e){
		if (e==="subs") loadSubs();
		if (e==='settings') loadSettings();
		if (e==='profile') loadProfile();
	}

	$( ".menu_link" ).click(function() {
	  	$( ".menu_link" ).removeClass('active');
		$(this).addClass('active');
		newTab(this.id);
	});

	//#### END LOADTABS ####

}

function mobile(){
	console.log('mobile')
	alert('mobile');
}
