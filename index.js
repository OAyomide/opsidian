var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var feedRead = require('feed-read');
var app = express();
var port = process.env.PORT || 5000; //we set the listening port for the app
var link = "your-link-here"; //for me, I used ngrok to start my localserver, then used the url.. Of course, you can
                                //use just about any url

//we want to set the port get and set methods. These will handle
//our request and response. i.e E.G app.get('/') serves the
//homepage.. while app.set(port) sets the env port

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());
//this req will return 'Hey there! I can code in Node/Express js' Here, we could serve an entire full page (we will get to that)
app.get('/', function(req, res){
    res.send('Hey there! I can code in Node/Express js');
});

//we are setting the url path for the webhook. Facebook needs this, so pay attention (or really dont)
app.get('/webhook/', function(req, res){
    //this line simply means when body-parser parses the page,
    //and the request query has a 'field' which is opsidian_verify then do bla bla bla
    //whicb in this case is send back some strings
    if(req.query['hub.verify_token']==='opsidian_verify'){
        res.send(req.query['hub.challenge'])
    }
    res.send('This is a sacred page. You have no access here');
})

//we fire up our server so we can finall see stuffs happen
app.listen(port, function(){
    console.log('Sweet app up and running at port: ', port);
})

//we have handled the get requests, we are now going handle
//post requests (Really, If you are readinf this I dont need to explain
//post and get requests again. I dont even need to comment at all)

//we are POSTing to the /webhook url. The same could be done when handling form handling in expressjs
app.post('/webhook', function(req, res){
    var stuffs = req.body;

    //we make sure we are dealing with a page subscription here
    if(stuffs.object === 'page'){
        //we are looping over each entry
        stuffs.entry.forEach(function(entry){
            //we are setting variables for each property
            //of entry. You get the gist I bet
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            entry.messaging.forEach(function(event){
                if(event.message){
                    //what this does is that it the event is a message, fire up this function
                    //this is extremely useful when the user messages our bot
                    //we will declare this function later
                    //in the future, probably in another file, then we export it.
                    receivedMessage(event)
                };
            });
        });
    };
});

//we will believe its a green, hence send a server status of 200 (means all is well);
res.sendStatus(200);

function receivedMessage(event){
    var senderID = event.sender.id;
    var timeOfMessage = event.timestamp;
    var recipientID = event.recipient.id;
    var message = event.message;

    //we simply log to console so we can be rest-assured and keep track on stuffs
    console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));


  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
}

if (messageText) {
    switch(messageText){
        case 'Buttons':
            quickButtons(senderID);
            break;
        case 'hello':
            sendTextMessage(senderID,"Hello there!")
            break;
        case 'article':
          getArticle(function(err, res){
            sendArticle(senderID, res);
          });
          break;
        default:
            senderTextMessage(senderID,messageText)
            }
       callsendAPI(messageData)
       }



function quickButtons(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
    text:"Quick action",
    quick_replies:[
      {
        content_type:"text",
        title:"Second stuff",
        payload:"second"
      },
      {
        content_type:"text",
        title:"Third stuff",
        payload:"third"
      },
      {
        content_type:"text",
        title:"First stuff",
        payload:"firststuff"
      }
    ]
  }
}
callSendAPI(messageData);
} //note that the limit to number of stuffs you can add is about 11, so it prertty much covers a lot.




function sendTextMessage (recipientId, messageText){
  var messageData = {
    recipient : {
      id: recipientId
    },
    message:{
      text: messageText
    }
  };
  callSendAPI(messageData);
}


function getArticle(callback) {
    feedRead(link, function(err, articles){
        if (err){
            callback(err);
        }
        else{
               callback(null, articles)
               console.log("It actually works");
        }
    });

}  //we are simply using this to get thee rss XML feed... We can then parse it.


//for this function, we are simply parsing the returned XML.... the result is like this:
//        "title"     - The article title (String).
  //   * "author"    - The author's name (String).
  //   * "link"      - The original article link (String).
  //   * "content"   - The HTML content of the article (String).
  //   * "published" - The date that the article was published (Date).
  //   * "feed"      - {name, source, link}

// so we can do stuffs like article.title to get our article's title... Please note if your rss feed has an attached image, it can be description property,
//etc. . . . So you can do stuffs like: article.description to get the image... Here, I used a fixed dummy data.
function sendArticle(recipientId, articles){
  var messageData ={
    recipient:{
      id:recipientId
    },message:{
        attachment:{
            type: "template",
            payload:{
                template_type:"generic",
                elements:[
                    {
                        image_url: "https://allhealth.000webhostapp.com/wp-content/uploads/2017/04/health.jpeg",
                        title: articles[0].title,
                        subtitle: articles[0].published.toString().substring(0, 21),
                        item_url: articles[0].link,
                        buttons:[{
                          type:"element_share"
                        }
                        ]
                      },{
                         image_url: "https://allhealth.000webhostapp.com/wp-content/uploads/2017/04/health.jpeg",
                        title: articles[1].title,
                        subtitle: articles[1].published.toString().substring(0, 21),
                        item_url: articles[1].link,
                        buttons:[{
                          type:"element_share"
                        }
                        ]
                      },{
                         image_url: "https://allhealth.000webhostapp.com/wp-content/uploads/2017/04/health.jpeg",
                        title: articles[2].title,
                        subtitle: articles[2].published.toString().substring(0, 21),
                        item_url: articles[2].link,
                        buttons:[{
                          type:"element_share"
                        }
                        ]
                      }
                ]
            }
        }
    }
    };
    callSendAPI(messageData);
}



function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  //user developer payload. . . what you want the 'action trigger' to be such that when user clicks on it, this 'string' 
    //would be sent to the server so that it will know what to do. . .
  var payload = event.postback.payload;
  switch (payload){
  case "intro":
  {
       request({
      url: "https://graph.facebook.com/v2.6/" + senderID,
      qs: {
        access_token: fb_page_token,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Greetings " + name + ". ";
      }
      var message = greeting + "I am the sanctuary cathedral bot. I will  get you church sermons every sunday, and also send you announcements(if you want)";
      sendTextMessage(senderID, message);
      quickButtons(senderID);
    });  
}
  break;
case "sermon":
  {
  sendTextMessage(senderID,"Here is the latest audio sermon");
  sendAudioMessage(senderID);
}
break;

case "menu":{
  sendChurch(senderID);
}
break;
case "contact":
  contact(senderID);
  break;
case "help":
  quickButtons(senderID);
  break;
}

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);
};






function callSendAPI (messageData){
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: fb_page_token
    },
    method: 'POST',
    json: messageData
  }, function(error, response, body){
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      console.log('Successfully sent generic message with id %s to recipient %s', messageId, recipientId);
    }
    else {
      console.error('Unable to send message.');
      console.error(response);
      console.error(error);
    }
  });
};


//and now we are done. . . . So we are going to split these stuffs into modules later on... But I gusess this is simple to use
