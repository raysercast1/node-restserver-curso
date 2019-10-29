// Puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
/*Variable que establece heroku. La idea es saber si estamos en produccion o en nuestra maquina*/
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// Base de Datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = 'mongodb+srv://raysercast:mVpu8XJMEgCXX4js@cluster0-p13nu.mongodb.net/test'
}

process.env.URLDB = urlDB;