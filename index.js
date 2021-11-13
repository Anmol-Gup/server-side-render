const express = require('express')
const app = express()
const fs = require('fs')
const port = 3000;
const session = require('express-session');

app.use(express.static('public'));
app.use(express.urlencoded({ extended:true }));
app.set('view engine','ejs');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.get('/user',(req,res)=>{
	
	read('data.txt',(err,data)=>
	{
		if(err)
			res.end('<h1> Something Went Wrong!</h1>');
		else
			res.end(data);
	})

});

app.get('/', (req, res) => {
	
	const {username} = req.session;

    if(!username)
        res.redirect('/login');
    else
    {
        read('data.json',(err,data)=>{
            
            data = JSON.parse(data);
            res.render('data',{name: username, data: data.users});
        })
    }
        
})

app.get('/login',(req,res)=>{
	
	if(req.session.is_logged_in)
		res.redirect('/');
	else
		res.sendFile(__dirname+'/views/login.html');

});

app.get('/signup',(req,res)=>{

	if(!req.session.is_logged_in)
		res.sendFile(__dirname+'/views/signup.html');
	else
		res.redirect('/');
});

app.post('/login',(req,res)=>{
	
	read('data.txt',(err,data)=>{
		data=JSON.parse(data);

		let temp=data.findIndex(value=>{
				return value.name===req.body.username && value.password===req.body.password;
		});
	
		if(temp===-1){
			res.end('<h1>Invalid Username or Password</h1><h2><a href="/login">Back to Login</a></h2>');
		}
		else
		{
			req.session.is_logged_in=true;
			req.session.username=req.body.username;
			res.redirect('/');
		}
	});

});

app.post('/signup',(req,res)=>{
	
	read('data.txt',(err,data)=>
	{
		if(err)
			res.end('<h1> Something Went Wrong!</h1>');
		else
		{
			data=JSON.parse(data);
			
			let emailFlag=data.findIndex(value=>{
				return value.email===req.body.mail;
			});
			
			console.log(emailFlag);

			if(emailFlag!==-1)
			{
				res.end('<h1>Email Already Exists!</h1><h2><a href="/signup">Back to Signup</a></h2>');
			}
			else{
				
				data.push({name:req.body.username, password: req.body.password, email: req.body.mail});
			
				fs.writeFile('data.txt',JSON.stringify(data),(err)=>{
					console.log('Data Inserted!');
				})
			
				res.redirect('/login');
				
			}
		}
	})

});

app.get('/logout',(req,res)=>{
	
	req.session.destroy(err=>{
		if(err)
			res.end(err);
		else
			res.redirect('/');

	});

});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

const read=(path, callback)=>{
	fs.readFile(path, (err,data)=>{
		callback(err,data);
	})
}