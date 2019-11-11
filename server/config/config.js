// Puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
/*Variable que establece heroku. La idea es saber si estamos en produccion o en nuestra maquina*/
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/*Vencimiento del token:
60 segundos
60 minutos
24 horas
30 dias */
process.env.EXPDATE_TOKEN = 60 * 60 * 24 * 30;

/*SEED de autenticacion */
process.env.SEED_PROD = process.env.SEED_PROD || 'seed-dev';

//Client ID Google

process.env.CLIENT_ID = process.env.CLIENT_ID || '98227200997-e4pqpl9lihdtgr07eqj1ciep0pksdnma.apps.googleusercontent.com';



// Base de Datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;