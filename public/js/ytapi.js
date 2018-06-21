// const clientID = "1063625321268-2aftgji9ascvn3hsvm33buu476dvnufp.apps.googleusercontent.com"; 
const clientID = "1063625321268-0lh1am1i2frrq7hamii4ofrsl1qoc6r1.apps.googleusercontent.com";
const socket = io();
let channels =[];
let titles = [];
let totalResults = 0;
let newvideos =[];
var temp = 0;
var playvideoID ='';
let searchPress = false;


/***** START BOILERPLATE CODE: Load client library, authorize user. *****/

  // Global variables for GoogleAuth object, auth status.
  var GoogleAuth;

  /**
   * Load the API's client and auth2 modules.
   * Call the initClient function after the modules load.
   */
  function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

  function initClient() {
    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes

    gapi.client.init({
        'clientId': `${clientID}`,
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
        'scope': 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtubepartner'
    }).then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);

      // Handle initial sign-in state. (Determine if user is already signed in.)
      setSigninStatus();


      //here was click func
    });
  }

  function handleAuthClick(event) {
    // Sign user in after click on auth button.
    GoogleAuth.signIn();

    

  }

  function setSigninStatus() {
    var user = GoogleAuth.currentUser.get();

    isAuthorized = user.hasGrantedScopes('https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtubepartner');
    // Toggle button text and displayed statement based on current auth status.
    if (isAuthorized) {
      saveProfile(user);
      defineRequest();
    }else{
      loadLoginPanel();
    }
  }

  function updateSigninStatus(isSignedIn) {
    setSigninStatus();
  }

  function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
      var value = properties[p];
      if (p && p.substr(-2, 2) == '[]') {
        var adjustedName = p.replace('[]', '');
        if (value) {
          normalizedProps[adjustedName] = value.split(',');
        }
        delete normalizedProps[p];
      }
    }
    for (var p in normalizedProps) {
      // Leave properties that don't have values out of inserted resource.
      if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
        var propArray = p.split('.');
        var ref = resource;
        for (var pa = 0; pa < propArray.length; pa++) {
          var key = propArray[pa];
          if (pa == propArray.length - 1) {
            ref[key] = normalizedProps[p];
          } else {
            ref = ref[key] = ref[key] || {};
          }
        }
      };
    }
    return resource;
  }

  function removeEmptyParams(params) {
    for (var p in params) {
      if (!params[p] || params[p] == 'undefined') {
        delete params[p];
      }
    }
    return params;
  }

  function executeRequest(request,type) {
    request.execute(function(response) {
      if(response!== undefined){
        if(type==='getsubs'){
          if(totalResults < response.pageInfo.totalResults){
            totalResults+=response.items.length;
            
            $(response.items).each((e,b)=>{
                channels.push(b);
                //Instant save channels list to localstorage
                localStorage.removeItem('subsList');
                localStorage.setItem('subsList',JSON.stringify(channels));

            })
             buildApiRequest('GET',
                    '/youtube/v3/subscriptions',
                    {'mine': 'true',
                      'pageToken': `${response.nextPageToken}`,
                      'maxResults': '50',
                     'part': 'snippet,contentDetails'},'getsubs');
          }else{
            getLastVideos();
          }
        }
      }
      if(type==='getvid'){
        //#### if the result has videos, push all of them in all videos list. ####
          if(response.items != null && response.items != undefined && response.items != 0){
              $(response.items).each((e,b)=>{
                function pushvid(){
                  //instant show arrived video, don't wait until all vodeos was added.
                  showVid(b);
                  newvideos.push(b);
                  //Instant save video list to localstorage
                  localStorage.removeItem('subsVidList');
                  localStorage.setItem('subsVidList',JSON.stringify(newvideos));
                      
                }
                //check if video is already added
                  if(titles.includes(b.snippet.title)=== false){
                    // check content type is uploaded video
                    if(b.snippet.type==='upload'){
                      titles.push(b.snippet.title);
                      pushvid();
                    }
                  }
       
              });
            // }
        //#### end push ####

        //#### If temp == total channels number,it means that cicle is over so now we can show all videos ###
          if(temp+1 === channels.length){
            //#### Save videos list to local storage & user data base ####
            // to be develop
            //#### end save videos ####
            // console.log('chan: ',channels);
            // console.log('vid: ', newvideos);
              channels =[];
              titles = [];
              totalResults = 0;
              newvideos =[];
              temp = 0;
              saveTime();
          }
        //#### end ####
      }

    }
    if(type==='search'){
      $('#content').html('');
      $('#subs').removeClass('active');
      for(var i = 0; i< response.items.length;i++){
        

        showVid(response.items[i]);
      }
      // console.log('show search ',response);
    }
    });
  }

  function buildApiRequest(requestMethod, path, params, properties ) {
    params = removeEmptyParams(params);
    var request;
    if (properties) {
      var resource = createResource(properties);
      request = gapi.client.request({
          'body': resource,
          'method': requestMethod,
          'path': path,
          'params': params
      });
    } else {
      request = gapi.client.request({
          'method': requestMethod,
          'path': path,
          'params': params
      });
    }
    executeRequest(request, properties);
  }

  /***** END BOILERPLATE CODE *****/

  
  function defineRequest() {
    if(searchPress!==true){
      if(isSaved()){
        console.log('SHOW OLD:', JSON.parse(localStorage.getItem('subsVidList')));
      }else{
          buildApiRequest('GET',
                  '/youtube/v3/subscriptions',
                  {'mine': 'true',
                    // 'order': 'unread',
                    'maxResults': '50',
                   'part': 'snippet,contentDetails'},'getsubs');
        }
        
      
    }else{
      var keywords = $('.form-control').val();
          buildApiRequest('GET',
                  '/youtube/v3/search',
                  {'maxResults': '15',
                   'part': 'snippet',
                   'q': keywords,
                   'type': ''},'search');
    }

  }



//#### get all videos publishied after yesterday date, from each channel ####
function getLastVideos(){
  if(isSaved()){
    let savedvideos = JSON.parse(localStorage.getItem('subsVidList'));
  }else{

    // Refresh videos feed:
    var d = new Date();
    var dHours = (d.getHours()*60) + d.getMinutes();
      // d.setDate(d.getDate() - 1);
      d = d.toISOString();
      d = parseInt( d.substr(0,10).replace(/-/g, '') );
    for( var i =0; i< channels.length; i++){
        $.ajax(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyAy0dpcKG7ZRz2TcVkSL3-DS2ig4YrLoew&channelId=${channels[i].snippet.resourceId.channelId}&part=snippet,id&order=date&maxResults=20`,(data)=>{
        
      }).done((data)=>{
        for(n=0; n<data.items.length; n++){
          // Show only videos for the last 24 hours
          // 24 hours = 1440 minutes
          var videoTime = data.items[n].snippet.publishedAt;
          var vidDate = parseInt( videoTime.toString().substr(0,10).replace(/-/g, '') );
          var vidMinutes = videoTime.toString().substr(videoTime.indexOf('T')+1,5).replace(/:/g, '');
          var vidTotal = (parseInt(vidMinutes.substr(0, 2)) * 60 ) + parseInt(vidMinutes.substr(2,4));
          // if(data.items[n].snippet.publishedAt.toString().substr(0,10) === d.substr(0,10)){
          if( (vidDate - d === 0 || vidDate - d === -1  ) && (dHours - vidTotal <= 1440) ){

             if(titles.includes(data.items[n].snippet.title)=== false){
               // check content type is uploaded videos
              if(data.items[n].id.kind === 'youtube#video'){


                titles.push(data.items[n].snippet.title);
                showVid(data.items[n],i);
                newvideos.push(data.items[n]);

                //Instant save video list to localstorage
                localStorage.removeItem('subsVidList');
                localStorage.setItem('subsVidList',JSON.stringify(newvideos));
              }
            }
          }else{
            break;
          }
        }
        
      })

        if(i+1 === channels.length){
            //#### Save videos list to local storage & user data base ####
              channels =[];
              titles = [];
              totalResults = 0;
              newvideos =[];
              temp = 0;
              saveTime();
          }

      // buildApiRequest('GET',
      //                 '/youtube/v3/activities',
      //                 {'channelId': `${channels[i].snippet.resourceId.channelId}`,
      //                  'maxResults': '5',
      //                  'publishedAfter' : `${d}`,
      //                  'part': 'snippet,contentDetails'},'getvid');
      temp=i;
    }
    

  }
  
}
//### end get videos ####

//#### Check if videos was saved already for last 2 minutes: ####

function isSaved(){
  let time = new Date();
  let savedTime = JSON.parse(localStorage.getItem('lastSaved'));

  if(savedTime != null && savedTime != undefined){
    if( time.getMonth() === savedTime.m &&
        time.getDate() === savedTime.d &&
        time.getHours() === savedTime.h &&
        (time.getMinutes() - savedTime.min) < 30
      ){ return true; }else{ return false; }
  }else{ return false; };

   
}

function saveTime(){
  let time = new Date();

    localStorage.removeItem('lastSaved');
    localStorage.setItem('lastSaved',JSON.stringify({'m':time.getMonth(),'d':time.getDate(),
                                            'h':time.getHours(),'min':time.getMinutes()
                                          }));
//remove loader
    $('.loader').remove();
    
}
//#### end Check saved ####



function addVideo(data){
   $(data.items).each((index,value)=>{
          videos.push(value);
    })
}

function sortVideos(){

  newvideos.sort(function(a, b) {
    a = new Date(a.snippet.publishedAt);
    b = new Date(b.snippet.publishedAt);
    return a>b ? -1 : a<b ? 1 : 0;
  });

  // console.log('SORTED: ',newvideos);
  // displayFeed();
}

// function displayFeed(){
//   // console.log(videos)
//   // console.log(videos[0].snippet.thumbnails.medium)
//     $(container).append($('<img>').attr('src',videos[0].snippet.thumbnails.medium.url))
// }

//#### Both DESKTOP and MOBILE ####

function showVid(data,chn_nr){
  //#### search ####

  if (('#content .login-panel').length > 0){
    $('#content .login-panel').remove();
  }
  var row = $('.row');
  if(row.length < 1 || row === null || row === undefined){
    row = $('<div>').addClass('row').append($('<div>').addClass('vd-container'));
    $('#content').append( row );
  }
  $('.vd-container').append(
    $('<div>').addClass('col-sm-3 test').append($('<img>').attr({'src':`${data.snippet.thumbnails.medium.url}`,'id':`${data.id.videoId}`})
    ).append(
        $('<h5>').addClass('vdtitle').html(data.snippet.title)
      ).append(
        $('<h6>').addClass('chn-name').html(data.snippet.channelTitle)
      )
  )

  $('.vd-container .col-sm-3 img').click((event)=>{ 
    openVideoPlayer(event.target.id); 
  })
  
    
   
  $('.search_btn').click(function(){
    //clear page
    $('#content').html($('<div>').addClass('loader'));
    searchPress = true;
    defineRequest();
  });
  
}

//#### Show user profile ####
function Person(id,photo,first, last, total) {
    this.id = id;
    this.photo = photo;
    this.firstName = first;
    this.lastName = last;
    this.watchStat = total;
}

function showProfile(){
  var persInfo = JSON.parse(localStorage.getItem('user'));

  $('.container').html(

    $('<div>').attr('id','content').css({'margin-top':'1px','height':'100%'}).html(
    $('<div>').addClass('panel-group profile_panel').append(
      $('<div>').addClass('panel panel-default').append(
          $('<div>').addClass('panel-heading').append(
              $('<h4>').html('Profile')
          )
      ).append(
        $('<div>').addClass('panel-body')
            .append(
                $('<div>').addClass('profile-Menulist')
                .append(
                  $('<div>').addClass('profile-icons').attr('id','usr-photo').attr('id','').append(
                    $('<img>').attr('src',persInfo.photo)
                  )
                )
                .append(
                  $('<ul>').addClass('nav nav-pills nav-stacked').append(
                    $('<li>').addClass('active').attr('id','profile-menu').html('<h5>Profile</h5>')
                  ).append(
                    $('<li>').attr('id','profile-settings').html('<h5>Settings</h5>')
                  )
                ) 
                
            )
            .append(
                  $('<div>').addClass('profile-openedMenu')
                      .append(
                        $('<div>').addClass('type-name').html('Name')
                      )
                      .append(
                        $('<div>').addClass('type-response').html(`${persInfo.firstName} ${persInfo.lastName}`)
                      )
                      .append(
                        $('<div>').addClass('type-name').html('ID')
                      )
                      .append(
                        $('<div>').addClass('type-response').html(`${persInfo.id}`)
                      )
                      .append(
                        $('<div>').addClass('type-name').attr('id','watched-stats').html('Total watched time')
                      )
                      .append(
                        // $('<div>').addClass('type-response').html(`${persInfo.watchStat.toLocaleString('en')} sec.`)
                        $('<div>').addClass('type-response').html(`${fancyTimeFormat(persInfo.watchStat)} `)
                      )
                      .append(
                        $('<div>').addClass('type-name').attr('id','earned-user').html('Activity Points')
                      )
                      .append(
                        $('<div>').addClass('type-response').html(`${persInfo.watchStat.toLocaleString('en')} VP`)
                      )
                      .append(
                        $('<div>').addClass('type-name').attr('id','earned-atuthor').html('Content Points')
                      )
                      .append(
                        $('<div>').addClass('type-response').html(`0 CP`)
                      )
                      .append(
                        $('<div>').addClass('type-name').attr('id','balance').html('Balance')
                      )
                      .append(
                        $('<div>').addClass('type-response').html(`0 COP`)
                      )     
             )
      )
     
    )
  )
)
  


}

//#### Calculate watched time ####
function fancyTimeFormat(time){   
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs +'h' + " : " + (mins < 10 ? "0" : "");
    }
    ret += "" + mins+'m' + " : " + (secs < 10 ? "0" : "");
    ret += "" + secs+'s ';
    return ret;
}
//#### end calculate ####

function saveProfile(data){
  let old = JSON.parse(localStorage.getItem('user'));
  let userParam = '';
  let timeW = 0;
  if(old !== undefined && old !== null){  timeW = old.watchStat; }
  userParam = new Person(data.w3.Eea, data.w3.Paa, data.w3.ofa, data.w3.wea, timeW);
  
  localStorage.setItem('user', JSON.stringify(userParam));
  // showProfile();
  
 
}


function loadLoginPanel(){
   $('#content').html(
        $('<div>').addClass('panel panel-default login-panel').append(
          $('<div>').addClass('panel-body login-body').append(
            $('<h5>').html('Sign in via YouTube')
          ).append(
            $('<div>').addClass('yt-logo')
          )
        ).append(
          $('<div>').addClass('panel-footer login-footer').append(
            $('<button>').attr('id','execute-request-button').html('Sign in').click(function() { handleAuthClick(event); })
          )
        )
  )
}


//#### Open video player ####//
function openVideoPlayer(id){
  // $('.menu_link active').removeClass('active');
      localStorage.setItem('VDID',id);
      window.location = 'player';
  }
  //end find video
  
function showvdPlayer(videoData){

  // $.getJSON(`https://www.googleapis.com/youtube/v3/videos?id=${id}&key=AIzaSyAy0dpcKG7ZRz2TcVkSL3-DS2ig4YrLoew&part=snippet&callback=?`,function(data){
    // if (typeof(data.items[0]) != "undefined") {
        // videoData = data;
        $('#content').html(
          $('<div>').addClass('vdplayer-container').append(
              $('<div>').addClass('vdplayer')
              .append(
                $('<iframe>').attr({'id': 'player','src':`http://www.youtube.com/embed/${videoData.id.videoId}?autoplay=1&color=white`,
                  'width':'640','height':'360','frameborder':'0','allowfullscreen':'true'
                  }))
              .append(

                    `
                    <h4>${videoData.snippet.title}</h4>
                    <div class="panel-group">
                      <div class="panel panel-default">
                        <div class="panel-heading">
                        <a data-toggle="collapse" href="#collapse1">
                          <h4 class="panel-title">
                            Description
                          </h4>
                          </a>
                        </div>
                        <div id="collapse1" class="panel-collapse collapse">
                          <div class="panel-body">${videoData.snippet.description}
                          <br/>
                          <a href='https://youtu.be/${videoData.id.videoId}' target= '_blank'><h6>Read full description on YouTube (open in new tab)</h6></a> 
                          </div>

                        </div>
                      </div>
                    </div>`
                  
                )
            )

        )
          
       // } else {
        // console.log('video not exists');
     // }   
    // });

}


//#### end video player ####//

//#### search
// function search(words){
//   buildApiRequest('GET',
//                 '/youtube/v3/search',
//                 {'maxResults': '15',
//                  'part': 'snippet',
//                  'q': `${words}`,
//                  'type': ''},'words');

// }




