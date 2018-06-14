const container = $('.container');
const socket = io();
// import { handleClientLoad } from './ytapi.js';
$(document).ready(function(){
      var win = $(this); 
      if (win.width() <= 799) { mobile()  }
      if (win.width() > 800) { desktop() }
});


function desktop(){
//#### Load tabs ####
	newTab('subs');// On first load show subs
	function loadSubs(){
		// container.html(
		if($('.search').length < 1){
			$('<div>').addClass('col-xs-6 search').html(
				$('<input>').attr({type:'text',placeholder:'Search'}).addClass('form-control')
			).append( $('<div>').addClass('search_btn') ).insertBefore('#content')
		}
			$('#content').html(
				$('<div>').addClass('loader')
			)
		// )

		if( isSaved() ){
			//show old content
    		let savedvideos = JSON.parse(localStorage.getItem('subsVidList'));
			 // var row = $('.row');
				// if(row.length < 1 || row === null || row === undefined){
				//     row = $('<div>').addClass('row');
				//     $('.container').append( row );
				// }
				

				// 	$(row).append(
				// 	    $('<div>').addClass('col-sm-3 test').append($('<img>').attr('src',savedvideos[i].snippet.thumbnails.medium.url))
				// 	 );
				

				 var row = $('.row');
				  if(row.length < 1 || row === null || row === undefined){
				    row = $('<div>').addClass('row').append($('<div>').addClass('vd-container'));
				    $('#content').append( row );
				  }
				  $('.loader').remove();
				  for(var i =0; i<savedvideos.length;i++){
				  $('.vd-container').append(
				    $('<div>').addClass('col-sm-3 test').attr('id',savedvideos[i].id.videoId).append($('<img>').attr('src',savedvideos[i].snippet.thumbnails.medium.url)).append(
				        $('<h5>').addClass('vdtitle').html(savedvideos[i].snippet.title)
				      ).append(
				        $('<h6>').addClass('chn-name').html(savedvideos[i].snippet.channelTitle)
				      )
				  );
				}
			}else{
				//refresh content
				handleClientLoad();
			}

	}

	function loadSettings(){
		alert('clicked settings');
	}

	function loadProfile(){
		$('.search').remove();
		var user =localStorage.getItem('user');
		if( user !== null && user !== undefined ){
  			showProfile();
		}else{
			loadLoginPanel();
		  // Call handleAuthClick function when user clicks on "Authorize" button.
	      
		}
		

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


