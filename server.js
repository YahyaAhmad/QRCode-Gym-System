var express = require('express');
var app = express();
var server = app.listen(3000);
var fs = require('fs');
var jsdom = require("jsdom");
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'));
var database = PouchDB('./db/gym_database');
var QRCodeApp = require('qrcode');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

var nodemailer = require('nodemailer');
var email_data = fs.readFileSync('./public/db/email.json');
var email_json = JSON.parse(email_data);
var transporter = nodemailer.createTransport(email_json); 
const opn = require('opn');

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });


app.use(express.static('public'));
app.get("/users/send" ,sendEmail);
app.get("/users/get/:qrcode",getUsers);
app.get("/users/add",addUser);
app.get('/admin/login',login);
app.get('/admin/months/get',getMonths);
app.get('/admin/months/remove',removeMonth);
app.get('/admin/months/add',addMonth);
app.get('/admin/users/getall',getAllUsers);
app.get('/admin/users/edit',editUser);
app.get('/admin/users/delete', deleteUser);
app.get('/admin/email/change', changeEmail);
app.get('/admin/account/change',changePassword);
console.log("Server has started...");
opn('http://localhost:3000');
// Add headers

function getUsers(req,res){

	var qrcode = req.params.qrcode;
	database.get(qrcode,function(err,result){
		var found = {status:'not found',object:null};
		if(result){
			found.status = 'found';
			found.object = result;
		}
		res.json(found);

	});

	// var json = JSON.parse(data);
	// var found = checkQRCode(json,qrcode);
	// res.json(found);
	


}

function addUser(req,res){
	var toSend = {name:''};
	var name = req.query.name;
	var time = req.query.time;
	var email = req.query.email;
	var expireDateUTC = new Date(parseInt(time));
	var expireDate = formatDate(expireDateUTC);
	console.log(expireDate);
	var qrcode = req.query.qrcode;
	toSend.name = name;
	toSend.expire = expireDate;
	toSend.email = email;
	toSend._id = qrcode;
	database.put(toSend).catch(function(err){

		
		database.get(qrcode,function(err,result){

			result._deleted = true;
			database.put(result);
			database.put(toSend);

		});
		
		// doc._deleted = true;
		// database.put(doc).catch(function(err){console.log(err);});
		

	});
	res.json(toSend);



}



function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('/');
}

function login(req,res){

	var username = req.query.user;
	var password = req.query.pass;
	var toSend = {status:'Not Found!',firsttime:null};


	var data = fs.readFileSync('./public/db/database.json');
	var json = JSON.parse(data);
	if(json.username==username && json.password==password){
		toSend.status = 'Found!';
		toSend.firsttime = json.firsttime;
	}
	res.json(toSend);
	console.log("Sent");




}



function sendEmail(req,res){

	var email = req.query.email;
	var expiration_date = req.query.time;
	var qrcodeText = req.query.qrcode;
	var exp_date = new Date(parseInt(expiration_date));
	var string_date = formatDate(exp_date);
	QRCodeApp.toFile('./qrcodes/qrcode.png', qrcodeText, function(err){
		if (err) throw err;
		console.log('done');
		var mailOptions = {
		from: "noreply@gymsystem.com",
		to: email,
		subject: 'Gym System QRCode',
		text: `Your expiration date is : ${string_date}`,
		attachments: [{   // stream as an attachment
		filename: 'qrcode.png',
		content: fs.createReadStream('./qrcodes/qrcode.png')
			}]
		};
		transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);

		fs.unlink('./qrcodes/qrcode.png', (err) => {
		if (err) throw err;
			console.log('path/file.txt was deleted');
		});

		}
	}); 


	});

	res.send('Sent!');
	
}

function getMonths(req,res){
	var data = fs.readFileSync('./public/db/months.json');
	var json = JSON.parse(data);
	res.json(json);

}

function removeMonth(req,res){
	var month = req.query.month;
	var data = fs.readFileSync('./public/db/months.json');
	var json = JSON.parse(data);
    let obj = json.find((o,i) => {if(o.months == month)  {json.splice(i,1); return true;} });
    json.sort(function (a, b) {
 	return a.months - b.months;
	});
	fs.writeFileSync('./public/db/months.json',JSON.stringify(json, null, 2));
	res.send("Deleted!");

}

function addMonth(req,res){
	var month = req.query.month;
	var priceQ = parseInt(req.query.price);
	var data = fs.readFileSync('./public/db/months.json');
	var json = JSON.parse(data);
	var newMonth = {months:month,price:priceQ};
	json.push(newMonth);
	json.sort(function (a, b) {
 	return a.months - b.months;
	});
	fs.writeFileSync('./public/db/months.json',JSON.stringify(json, null, 2));
	res.send("Added!");

}

function getAllUsers(req,res){

	var page = parseInt(req.query.page);
	var size = parseInt(req.query.size);
	var name = req.query.name;
	var email = req.query.email;

	if(name==null) name='';
	if(email==null) email='';

	var toSkip = (page - 1) * size;
	console.log(size);
	database.find({
		fields: ['name','expire','email','_id', '_rev'],
		selector: { $or: [{name: {$regex:`${name}|${name.toUpperCase()}|${name.toLowerCase()}`}},{email: {$regex:`${email}|${email.toUpperCase()}|${email.toLowerCase()}`}}]},
		limit: size,
		skip : toSkip

		// use_index: '_id'
	}, function (err, result) {
		if (err) { return console.log(err); }
		var toSort = result;
		res.send(toSort);
	});



}

function editUser(req,res){

	var id = req.query.id;
	var nameq = req.query.name;
	var emailq = req.query.email;
	var months = req.query.months;

	var expireq;
	
	var hash= guid();
	
	database.get(id,function(err,doc){
		if(err) return console.log(err);
		old = doc;
		if(months!=null){
			var oldDate = new Date(doc.expire);
			if( oldDate < new Date())
				oldDate = new Date();

			// oldDate = Date.parse();

			oldDate = oldDate.setMonth(oldDate.getMonth()+parseInt(months));
			expireq  = formatDate(oldDate);
		}
		else
			expireq = doc.expire;

		if(nameq==null) nameq=doc.name;
		if(emailq==null) emailq=doc.email;
		database.put({ //This is where I am.
		_id : id,
		name : nameq,
		expire : expireq,
		email : emailq,
		_rev : doc._rev
	},function(err,response){
		if(err) return console.log(err);
		res.send(response);
	});

	});





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

function deleteUser(req,res){

	var id = req.query.id;
	database.get(id,function(err,doc){

		if(err) return console.log(err);
		return res.send(database.remove(doc));

	});

}

function changeEmail(req,res){

	var email = req.query.email;
	var pass = req.query.pass;

	var data = {auth : {}};
	data.auth.user = email;
	data.auth.pass = pass;
	data.service = "gmail";
	fs.writeFileSync('./public/db/email2.json',JSON.stringify(data,null,3));
	res.send(data);

}

function changePassword(req,res){

	var pass = req.query.pass;
	var data = JSON.parse(fs.readFileSync('./public/db/database.json'));
	data.password = pass;
	fs.writeFileSync('./public/db/database.json',JSON.stringify(data,null,2));
	res.send(data);

}