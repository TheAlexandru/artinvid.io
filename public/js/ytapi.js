const clientID = "1063625321268-2aftgji9ascvn3hsvm33buu476dvnufp.apps.googleusercontent.com";
let channels =[];
let videos = [];
let totalResults = 0;


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
        'clientId': clientID,
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
      defineRequest();
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

  function executeRequest(request) {
    request.execute(function(response) {
      // console.log(response)
      if(totalResults < response.pageInfo.totalResults){
        totalResults+=response.items.length;
        
        $(response.items).each((e,b)=>{
          channels.push(b);
        })
         buildApiRequest('GET',
                '/youtube/v3/subscriptions',
                {'mine': 'true',
                  'pageToken': `${response.nextPageToken}`,
                  'maxResults': '50',
                 'part': 'snippet,contentDetails'});
      }else{
        console.log('Total channels',totalResults);
        // console.log('finished',channels);
        getLastVideos();
      }
      
    //save all channels
      // channels.push(response.items)
      // if(respnse.pageInfo.totalResults>25){
      //   for()
      // }
      // lastVideo();
    });
  }

  function buildApiRequest(requestMethod, path, params, properties) {
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
    executeRequest(request);
  }

  /***** END BOILERPLATE CODE *****/

  
  function defineRequest() {

    buildApiRequest('GET',
                '/youtube/v3/subscriptions',
                {'mine': 'true',
                  // 'order': 'unread',
                  'maxResults': '50',
                 'part': 'snippet,contentDetails'});

  }


function getLastVideos(){
  console.log(channels)
    $(channels).each((index,value)=>{
      $.get( `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channels[index].snippet.resourceId.channelId}&maxResults=5&order=date&type=video&key=AIzaSyAy0dpcKG7ZRz2TcVkSL3-DS2ig4YrLoew `
        ).done((data)=>{
        // $(data.items).each((index,value)=>{
        //   videos.push(value);
        // })
          addVideo(data);
          if (index+1 === channels.length) {
              sortVideos();
              // setTimeout(sortVideos,2000);
          }
      });
        
       
    })
   
    
}

function addVideo(data){
   $(data.items).each((index,value)=>{
          videos.push(value);
    })
}

function sortVideos(){

  videos.sort(function(a, b) {
    a = new Date(a.snippet.publishedAt);
    b = new Date(b.snippet.publishedAt);
    return a>b ? -1 : a<b ? 1 : 0;
  });

  console.log(videos);
}




