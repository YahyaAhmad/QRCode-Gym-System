var beep = new Audio('beep.wav');
var error = new Audio('error.wav');
var scannedData;
var found=false;

var scanner = new Instascan.Scanner({ video: document.getElementById('preview'), backgroundScan: true,scanPeriod: 1, refractoryPeriod: 1000 });

      addListener();
      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          scanner.start(cameras[0]);
        } else {
          console.error('No cameras found.');
        }
      }).catch(function (e) {
        console.error(e);
      });


function getRemainingDays(expireDate){
            var diff = Math.abs(new Date() - new Date(expireDate.replace(/-/g,'/')));
            var days = Math.floor(diff / (24*60*60*1000));
            return days;
}

function unicodeToChar(text) {
   return text.replace(/\\u[\dA-F]{4}/gi, 
          function (match) {
               return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });
}


function addListener(){

      scanner.addListener('scan', function (content) {

        $.getJSON('./users/get/' + content, function(data){
          var client = data.object;
          if(data.status=='found'){
            // beep.play();
            var days = getRemainingDays(client.expire);
            // d.setDate(client.ExpirationData);
            var curData = new Date();
            var name = unicodeToChar(client.name);
            var expireDate = new Date(client.expire.replace(/-/g,'/'));
            var text = `Name: ${name} </br>` +
            `Expiration Date: ${client.expire} </br>`;
            
            global_id = client._id;
            if(curData<expireDate){
            text += `Remaining Days: ${days} </br>` +
            `Code: <span class='fake-link' onclick='showLogin();'>${client._id}</span> </br>`;
            text += `<div class='access_granted'>ACCESS IS GRANTED</div>`;
            beep.play();
            }
            else{
              text += `Code: <span class='fake-link' onclick='showLogin();'>${client._id}</span> </br>`;
              text += `<div class='access_denied'>ACCESS DENIED!</div>`;
              error.play();
            }
          
            $('.console_text').html(text);
          }
          else{
            error.play();
            text = `Client not found. </br>` + `code: ${content}`;
            $('.console_text').html(text);
          }});
      }
      );

}