
	
	$(document).ready(function() {
		getMonths();
		getUsers();
		popup = $('.shadowBox').children().children('.popup');
		blackBackground = $('.shadowBox');
		document.getElementById('user').focus();
		// $('#client_table td').keydown(enterDocument);	
		// $('#client_table td').click(edit);
		$('#clientName').keydown(e=>{if(e.which==13) $('#searchBtn').click(); });
	});

	function getMonths(){
		$.getJSON('/admin/months/get',function(data){
			$('#month_table tbody').html('');
			$('#monthCombo').html('');
			// $('#month_table tbody').html('<tr class="table_header"><td>Months</td><td>Price</td><td><span style="position: relative; left: 131px;">Remove</span></td></tr>');
			$.each(data,function(object,value){
				var icon = `<i data-price="${value.price}" data-months="${value.months}" onclick="removeMonth(); getMonths();" class="fas fa-minus-circle delete_month_btn"></i>`

				$('#monthCombo').html($('#monthCombo').html() + `<option value="${value.months}">${value.months}</option>`);
				$('#month_table tbody').html($('#month_table tbody').html() + `<tr><td>${value.months}</td><td>$${value.price}</td><td>${icon}</td></tr>`);
			});
			
		});
	}

	function removeMonth(){
		var months = $(event.target).data('months');

		$.getJSON(`/admin/months/remove?month=${months}`);
	}
	var timeoutMonth;
	function addMonth(){
		var months = $('#monthsTxt').val();
		var price = $('#priceTxt').val();
		 if (isNaN(months) || isNaN(price)) return alert('Invalid input'); 
  		$.getJSON(`/admin/months/add?month=${months}&price=${price}`);
		$('#month_result').html('Offer has been added.');
		window.clearTimeout(timeoutMonth);
		timeoutMonth = setTimeout(function() {$('month_result').html('');}, 3000);

	}

	function enterDocument(event){
		if(event.which==13){

			console.log("Done");
			$(event.target).attr('contenteditable','false');
			
		}
	}

	function acceptDocument(event){
			console.log("Done");
			event.stopImmediatePropagation();
			var newName = $(event.target).parent().find('.user_name').html();
			var email = $(event.target).parent().find('.user_email').html();

			var id = $(event.target).parent().find('button').data('qr');

			$.getJSON(`/admin/users/edit?id=${id}&name=${newName}&email=${email}`);
			$(event.target).attr('contenteditable','false');
			$(event.target).children().toggleClass('edit_icon_active');
	}

	function edit(event){
		$(event.target).parent().toggleClass('edit_icon_active');
		$(event.target).parent().parent().attr('contenteditable','true').focus().focusout(done);
	}

	function done(){
		$(event.target).attr('contenteditable','false');
	} 

	function getUsers(name){
		$('#client_table tbody').html('');
		if(name!=null){
			var add = `&name=${name}&email=${name}`;
		}
		$.getJSON('/admin/users/getall?size=5&page=1' + add,function(data){
			data.docs.sort((a, b) => a.name.localeCompare(b.name))
			$.each(data.docs,function(key,value){
				var icon = `<i data-id='${value._id}' onclick="removeUser($(this).data('id'));" class="fas fa-minus-circle delete_user_btn"></i>`;
				var oldHtml = $('#client_table tbody').html();
				$('#client_table tbody').html(oldHtml + `<tr><td onblur='acceptDocument(event);' onmouseenter="showIcon();" onkeydown='enterDocument(event);' onmouseleave="showIcon();"><span class='edit_icon'><i onclick='edit(event);' class="fas fa-pencil-alt edit_icon"></i></span><span class='user_name'>${value.name}</span> </td><td class='td_email' onblur='acceptDocument(event);' onmouseenter="showIcon();" onkeydown='enterDocument(event);' onmouseleave='showIcon();'"><span class='edit_icon'><i onclick='edit(event);' class="fas fa-pencil-alt edit_icon"></i></span> <span class='user_email'>${value.email}</span></td><td><span class='user_exp'>${value.expire}</span></td><td><button class='qrcode_button' onclick='qrPopup(event);' data-qr='${value._id}'></button></td><td>${icon}</td></tr>`);

			});

		});
	}

	function search(){
		getUsers($('#clientNameTxt').val());
	}

	function showIcon(){
		$(event.target).children().toggleClass('display_show');
	}

	function qrPopup(event){
	var email = $(event.target).parent().parent().find('.user_email').html();
	var expireDate = Date.parse($(event.target).parent().parent().find('.user_exp').html());
	var guiCode = $(event.target).data('qr');
  	if(window.confirm(`You are about to resend the qrcode to ${email}`)){
  		$.getJSON(`/users/send?email=${email}&time=${expireDate}&qrcode=${guiCode}`);
  	
  	}}

  	function removeUser(id){

  		if(window.confirm('You are about to delete a client.')){
  		$.getJSON(`/admin/users/delete?id=${id}`);
  		getUsers();
  		}



  	}

  	function changeEmail(){

  		var email = prompt("Please enter you email");
  		if(email==null) return;
  		var pass = prompt("Please enter your password");
  		if(pass==null) return;
  		if(!validateEmail(email) || pass == '') return alert("Invalid input, please try again");

  		$.getJSON(`/admin/email/change?email=${email}&pass=${pass}`);
  		alert("Email changed sucessfully.");

  	}


  	function showPasswordForm(){
  		var passForm = `<form action=""> <table class="formTable passwordForm"> <tr> <td><label>Old Password</label></td> <td><input id='oldPass' type="password"></td> </tr> <tr> <td><label for="">New Password</label></td> <td><input  id='newPass' type="Password"></td> </tr> <tr> <td><label for="">Confirm Password</label></td> <td><input  id='reNewPass' type="Password"></td> </tr> <tr> <td><button type="button" onclick="changePassword();">Change</button></td> </tr> </table> </form>`;

  		$('.popup').html(passForm);
  		$('.shadowBox').addClass('escapable');
  		$('.shadowBox').removeClass('display_hide');
  		$('#oldPass').keydown(function(){

  			if(event.which==13)
  				changePassword();

  		});
  		$('#newPass').keydown(function(){

  			if(event.which==13)
  				changePassword();

  		});
  		$('#reNewPass').keydown(function(){

  			if(event.which==13)
  				changePassword();

  		});  		
  	}

  	function changePassword(){

  		var oldPass = $('#oldPass').val();
  		var newPass = $('#newPass').val();
		var reNewPass = $('#reNewPass').val();
		if(newPass!=reNewPass){
			alert('Invalid input');
			return $('.shadowBox').addClass('display_hide');
		}
		$.getJSON( `/admin/login?user=admin&pass=${oldPass}`,function(data){


			if(data.status=='Found!'){
				$.getJSON(`/admin/account/change?pass=${newPass}`);
				alert("Password has been changed");
			}


			else
				alert('Invalid input');
				return $('.shadowBox').addClass('display_hide');
		});

  	}