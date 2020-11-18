'use strict';
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use('/public',express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------

app.get('/home',handleHouses);
app.post('/house_name/characters',handlerenderHouseChar);
app.post('/my-characters',handleAddingToFav);
app.get('/my-characters',handleRenderingFav);
app.post('/my-characters/:id',handelDeatails);
app.put('/my-characters/:id',handelUpdate);
app.delete('/my-characters/:id',handleDelete);

// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------




function handleDelete(req,res){
  let sql = 'DELETE FROM users WHERE id=$1;';
  let values = [req.params.id];
  client.query(sql,values)
    .then(()=>{
      res.redirect('/my-characters');
    });
}

function handelUpdate(req,res){
  let sql = 'UPDATE users SET name=$1, patronus=$2 ,alive=$3 WHERE id = $4;';
  let values = [req.body.name,req.body.patronus,req.body.alive,req.params.id];
  client.query(sql,values)
    .then(()=>{
      res.redirect('/my-characters');
    });
}


function handelDeatails(res,req){
  let sql = 'SELECT * FROM users WHERE id = $1;';
  let values = [req.params.id];

  client.query(sql,values)
    .then(data=>{
      console.log(data.rows[0]);
      res.render('details',{result:data.rows[0]});
    });
}


function handleRenderingFav(req,res){
  let sql = 'SELECT * FROM users';
  client.query(sql)
    .then(data=>{
      res.render('favPage',{result:data.rows});
    });
}


function handleAddingToFav(req,res){
  let sql = 'INSERT INTO users(name, patronus, alive)VALUES($1,$2,$3);';
  let values = [req.body.name,req.body.patronus,req.body.alive];
  client.query(sql,values)
    .then(()=>{
      res.redirect('/my-characters');
    });
}


function Char(value){
  this.name = value.name;
  this.patronus = value.patronus;
  this.alive = value.alive;
}


function handlerenderHouseChar(req,res){
  let house = req.body.house;
  let url = `http://hp-api.herokuapp.com/api/characters/house/${house}`;
  superagent.get(url)
    .then(data=>{
      let values = data.body.map(element =>{
        return new Char(element);
      });
      res.render('chars',{result:values});
    });
}

function handleHouses (req,res){
  res.render('home');
}


// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------



// Express Runtime
client.connect().then(() => {
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
