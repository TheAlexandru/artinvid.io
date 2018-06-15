 window.onload = function(){
      console.log('load!!@#$!@$##@$@#%$#%$#%#$%#$$%')
       let findVideo = JSON.parse(localStorage.getItem('subsVidList'))
      //#### Find clicked video in all video list to show description and title ####
      for(var i =0; i< findVideo.length; i++){
        if(findVideo[i].id.videoId === playvideoID){
          
          // videoData = findVideo[i];
          // showvdPlayer(findVideo[i]);
        }
      }
  }
// 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      var timer, timeSpent = [];
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        $('#content').html('').append(
          $('<div>').addClass('vdplayer-container').append(
            $('<div>').addClass('vdplayer').append(
              $('<div>').attr('id','player')
            )
          )
        )
        player = new YT.Player('player', {
          height: '360',
          width: '640',
          videoId: `${playvideoID}`,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      var done = false;
      function onPlayerStateChange(event) {
        if(event.data === 1) { // Started playing
        if(!timeSpent.length){
            for(var i=0, l=parseInt(player.getDuration()); i<l; i++) timeSpent.push(false);
        }
        timer = setInterval(record,100);
      } else {
      clearInterval(timer);
    }
      }
      function stopVideo() {
        player.stopVideo();
      }

      function record(){
    timeSpent[ parseInt(player.getCurrentTime()) ] = true;
      showPercentage();
    }

    function showPercentage(){
      var percent = 0;
      for(var i=0, l=timeSpent.length; i<l; i++){

          if(timeSpent[i]) percent++;
      }
      
      console.log(percent);
    }
    