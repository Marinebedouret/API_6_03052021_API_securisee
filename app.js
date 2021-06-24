//dotenv sert à masquer les informations de connexion à la base de données à l'aide de variables d'environnement
require('dotenv').config()
const toobusy = require('toobusy-js');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');
const session = require('express-session');


//Routes des sauces et user
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const passwordValidatorSchema = require('./models/password');


const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//Connexion à mongoDB
mongoose.connect(process.env.DB_URL ,
    { useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
    
app.use(express.json());
//*************************************Securisation de l'application web "So Pekocko"***********************************************************

//*****************************************Utilisation du module express-mongo-sanitize********************************************************/
//Permet de supprimer des données
app.use(mongoSanitize());
//Permet de remplacer les caractères interdits par _
app.use(mongoSanitize({
  replaceWith: '_',
}),
);

//***********************************************Utilisation du module Express-rate-limit pour aider à prévenir des attaques de force brute*************/
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100 //limite chaque IP à 100 requêtes par windowMs
})
app.use(limiter); //S'applique à toutes les demandes
//********Utilisation du module toobusy pour protéger l'application d'un trafic réseau trop important*******************************************

//Indique la durée maximale en milisecondes pendant laquelle la file d'attente des événements est en retard.
toobusy.maxLag(10);
//Interval mesure le retard de boucle d'événément, en ms.
toobusy.interval(250);
let currentMaxLag = toobusy.maxLag(), interval = toobusy.interval();
toobusy.onLag(function(currentLag){
  console.log("Latence de boucle d'évènement détecté ! Latence : " + currentLag + "ms ");
});
//permet de bloquer les requêtes lorsqu'il y a un trafic réseau important.
app.use(function(req, res, next){
  if(toobusy()){
   return res.status(503).json({error : "Désolé, le serveur est occupé ! Veuillez réessayer plus tard !"});
  } else{
    next();
  }
});

//******************************************Utilisation du module express-session pour sécuriser les cookies****************************************/
app.use(session({
  name: 'session',
  secret: process.env.KEY_SEC,
  saveUninitialized: true,
  resave: false,
  cookie: {secure: true, httpOnly: true, domaine: 'http://localhost:3000', maxAge: 24*60*60*1000}
}));

//*******************Utilisation du module hpp ignore toutes les valeurs soumises pour un paramètre dans req.query et/ou req.body*******************/
app.use(hpp());

//*************************Utilisation du module helmet pour sécuriser divers en-têtes HTTP et de certaines vulnérabilités.***************************/
app.use(helmet());


app.use('/images', express.static(path.join(__dirname, 'images')));

//Routes API
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;