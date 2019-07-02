var express=require('express');
var app=express();
var mysql=require('mysql');
var path=require('path');
var bodyParser=require('body-parser');
var session=require('express-session');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');
var connection=mysql.createConnection({
	host: 'us-cdbr-iron-east-02.cleardb.net',
	user: 'b09299f851fd0e',
	password: 'cdfef872',
	database: 'heroku_53a42375c95469f'
});
connection.connect((function(err){
	if(err){
		console.log('error connecting;'+err.stack);
	}
	else{
		console.log('connected as id:'+connection.threadID);
	}
}));
app.use(session({
	secret : "secret_password",
	resave : true,
	saveUninitialized : true
}));
app.get('/',function(req, res){
	console.log("Home page served!!");
	res.sendFile(path.join(__dirname+'/login.html'));
});
app.post('/auth',function(req, res){
	console.log("auth route successfull!");
	console.log(req.body);
	var usernm=req.body.usrnm;
	var passwd=req.body.passwrd;
	var obj={};
	if(usernm&&passwd){
		var sql="select * from signup where username='"+usernm+"' and password='"+passwd+"';";
		connection.query(sql, function(err, result){
			if(err) throw err;
			if(result.length!=0)
			{
				req.session.loggedin=true;
				req.session.username=usernm;
				obj={'status':'success','message':'https://vipul-node-app.herokuapp.com/home'};
			}
			else{console.log("hello");
			obj={'status':'error','message':'Incorrect Username and/or Password'};
			}
			obj=JSON.stringify(obj);
			res.send(obj);
			
		});
	}
});
app.get('/logout',function(req, res){
	if(req.session.loggedin)
	{req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		return res.redirect('/');
	});
    }
    else{
    	res.send("You are not allowed to view this page!!");
    }

});
app.get('/travel',function(req, res){
	if(req.session.loggedin)
	{
		res.render('scrool_div',{username : req.session.username});
	}
	else{
		return res.redirect('/');
	}
});
app.post('/commnt',function(req, res){
if(req.session.loggedin)
{
	var username=req.session.username;
	var comment=req.body.message;
	var obj={};
	var sql="insert into comment values('"+username+"','"+comment+"');";
	connection.query(sql,function(err, result){
		if(err) throw err;
		else{
			obj={'status':'success'};
		}
	});
}
obj=JSON.stringify(obj);
res.send(obj);
});
app.get('/home',function(req, res){
	if(req.session.loggedin!=true){
		return res.redirect('/');
		res.end();
	}
	else{
		var sql1="select * from comment";
		connection.query(sql1,function(err, result){
		if(err) throw err;
		else{
			return res.render('dashboard',{username: req.session.username,commnt:result});
			res.end();
		}
	});
	}
});
app.post('/signup',function(req, res){
		console.log(req.body);
		var usernm=req.body.usrnm;
		var passwd=req.body.passwrd;
		var objmsg={};
		var sql="select * from signup where username='"+usernm+"';";
		connection.query(sql, function(err, result){
		if(err) throw err;
		else if(result.length==0){
				var sql1="insert into signup values('"+usernm+"','"+passwd+"');";
				connection.query(sql1,function(err, result){
					if(err) throw err;
					else{
						objmsg={'status':'success','message':'Signed up successfully'};
						res.send(JSON.stringify(objmsg));
						}

			});
			}
		else{
			objmsg={'status':'error','message':'Account already exists! Please choose another username!'};
			res.send(JSON.stringify(objmsg));
			}
			
		});
});
app.listen(process.env.PORT || 3000);