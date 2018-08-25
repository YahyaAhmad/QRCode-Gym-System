//Variables Definitions:
///////////////////////
var shown = false;

var localhost = 'http://localhost:3000/';

var global_id;



//Functions:

$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));

    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });

    return this;
  },
});
       
function showCamera(object){
        
        if(!shown){
          shown = true;
          $('.webcam').removeClass('hidden');
          $(object).children().removeClass('fa-angle-down');
          $(object).children().addClass('fa-angle-up');
        }
        else
        {
          shown = false;
          $('.webcam').addClass('hidden');
          $(object).children().removeClass('fa-angle-up');
          $(object).children().addClass('fa-angle-down');
        }

}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
/*
var date = new Date();
var dateNew = date.addDays(93);
var month = dateNew.getUTCMonth() + 1; //months from 1-12
var day = dateNew.getUTCDate();
var year = dateNew.getUTCFullYear();

newdate = year + "/" + month + "/" + day;

alert(newdate);
*/


function reload(){

      // var head= document.getElementsByTagName('head')[0];
      // var script= document.createElement('script');
      // script.src= './js/webcam.js';
      // head.appendChild(script);
      var button = event.target;
      $(button).css('pointer-events','none');
      scanner.stop();
      scanner = new Instascan.Scanner({ video: document.getElementById('preview'), backgroundScan: true,scanPeriod: 1, refractoryPeriod: 1000 });
      
      addListener();

      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          scanner.start(cameras[0]).then(function(){$(button).css('pointer-events','auto');});
          
        } else {
          console.error('No cameras found.');
        }
      }).catch(function (e) {
        console.error(e);
      });
}

function login(fun){



  var user = $('#user').val();
  var pass = $('#pass').val();
  $('.loader').removeClass('display_hide');
  return $.get( localhost + `admin/login?user=${user}&pass=${pass}`).then(checkLoginResponse);


}

function checkLoginResponse(data){

  
  if(data.status=='Found!')
  {
    return true;

      // $('.shadowBox').css('display','none');
      // $('.control_center').addClass('opacity_show');
  }
  else
  {
    return false;
    // $('.loader').addClass('display_hide');
    // $('.loader').parent().html('<div class="no_position"><div class="error">Username or password is incorret!</div></div>');
  }

}

function switch_menu(e){
  if(!e) e = window.event;
  var ev = e.target||e.srcElement;
  $('.active_menu').removeClass('active_menu');
  $(ev).addClass('active_menu');
  $('.active_control').removeClass('active_control');
  $(`.${ev.id}`).addClass('active_control');

}
var timeoutFun;
function generateCode(){
  if(invalidInput()){
  	$('#result').html('Invalid input, please try again.');
  	window.clearTimeout(timeoutFun);
 	timeoutFun = setTimeout(function(){$('#result').html(''); },3000);
  	return;
  }
  if($('#qrcodeHolder').hasClass('opacity_hidden')){
  	$('#qrcodeHolder').removeClass('opacity_show');

  }

  	setTimeout(writeQrCode,50);

}

function writeQrCode(){
	$('#qrcodeHolder').html('');
  var qrcode = new QRCode("qrcodeHolder",{    width: 180,
    height: 180});
  var guiCode = guid();
  var expireDate = new Date();
  var months = $( "#monthCombo option:selected" ).text();
  var email = $('#email').val();
  expireDate = expireDate.setMonth(expireDate.getMonth()+parseInt( months));
  qrcode.makeCode(guiCode);
  console.log(`gui: ${guiCode}, months: ${months}, expireDate: ${expireDate}`);
  $.getJSON(`/users/add?name=${$('#nameTxt').val()}&time=${expireDate}&qrcode=${guiCode}&email=${email}`);
  $.getJSON(`/users/send?email=${email}&time=${expireDate}&qrcode=${guiCode}`);
  $('#result').html('Client has been added.');
  $('#qrcodeHolder').addClass('opacity_show');
  window.clearTimeout(timeoutFun);
  timeoutFun = setTimeout(function(){$('#result').html(''); },3000);
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function invalidInput(){
	if(!validateEmail($('#email').val())) return true;
	if($('#nameTxt').val()==='') return true;
	if($('#email').val() != $('#email_confirm').val()) return true;
	return false;


}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function proceed(page){

  if(event.type=='keydown' && event.which != 13) return;
  var status;
  login().then(function(data){


    if(page=='admin')
    if(data==true){
      $('.shadowBox').addClass('display_hide');
      $('.control_center').addClass('opacity_show');
    }
    else{
      $('.loader').addClass('display_hide');
      $('.loader').parent().html('<div class="no_position"><div class="error">Username or password is incorrect!</div></div>');
    }

    else
      if(data==true)
      {
        var monthForm = `<table class="addMonthTable"> <tr> <td><label  for="">Months</label></td> <td><select id='monthCombo'> <option value="1">1</option> <option value="2">2</option> </select></td> </tr> <tr> <td><button onclick='addMonthToUser($("#monthCombo option:selected").text());'>Submit</button></td> <td></td> </tr> </table>`;
        $.getJSON('/admin/months/get',function(data){
          $('#monthCombo').html('');
          $.each(data,function(key,value){
            $('#monthCombo').html( $('#monthCombo').html() + `<option value='${value.months}'>${value.months}</option>` );


          });

        });
        $('.popup').html(monthForm).addClass('monthPopup');

      }
      else
      {
      $('.loader').addClass('display_hide');
      $('.loader').parent().html('<div class="no_position"><div class="error">Username or password is incorrect!</div></div>');
      }

  });




}

function showLogin(){

  var loginForm = `<form action=""> <table class="formTable"> <tr> <td><label>Username</label></td> <td><input id='user' onkeydown="proceed('index');" type="text"></td> </tr> <tr> <td><label for="">Password</label></td> <td><input onkeydown="proceed('index');" id='pass' type="Password"></td> </tr> <tr> <td><button type="button" onclick="proceed('index');">Login</button></td> <td><div class="loader display_hide"></div></td> </tr> </table> </form>`;
  $('.popup').removeClass('monthPopup').html(loginForm);
  $('.shadowBox').removeClass('display_hide');


}

function addMonthToUser(months){

  var messageForm = '<div>Done!</div>';
  $.getJSON(`/admin/users/edit?id=${global_id}&months=${months}`, function(data){

    alert('a client has been updated.');
    $('.shadowBox').addClass('display_hide');

  });
  

}

$(document).ready(function(){


  $(document).keydown(function(event){

    if(event.which==27)
    {
      if($('.shadowBox').hasClass('escapable'))
      $('.shadowBox').addClass('display_hide');
    }

  })

  $('.shadowBox').click(function(){

    if($('.shadowBox').hasClass('escapable'))
    if($(event.target).hasClass('shadowBox') || $(event.target).hasClass('center') ){
      $('.shadowBox').addClass('display_hide');
    }

  });

});