/* Importar la libreria para crear esquema en mongoDB */
const mongoose = require('mongoose');

/*con esta libreria aseguro que el throw error sea mas amigable...
y que no se repitan los campos en la DB*/
const uniqueValidator = require('mongoose-unique-validator');

/*Importar Schema de la libreria con multiples method y yo...
puedo definir y agregar los mios */
let Schema = mongoose.Schema;

/*Crear un validador de roles. Solo quiero roles con un valor...
predeterminado o permitido*/
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    /*Esta syntax de {XXXX} es valida por la exportacion de require('mongoose-unique-validator')*/
    message: '{VALUE} no es un rol valido'
}

//campos de la collection en mongoDB
//Schema definition
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
            /* Si el user no se crea con la propiedad de google,
siempre va a ser un usuario normal y esta propiedad siempre va
a estar en false*/
    }
});


/* para modificar el metodo toJSON en el usuarioSchema. Este metodo siempre se llama cuando 
se intenta imprimir mediante JSON. La idea es que el campo password no sea
regresado al usuario cada vez que el objeto se pase a un JSON.
En este momento se le esta enviando un JSON de respuesta al usuario con la libreria,
const bodyParser = require('body-parser') */
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject
}

usuarioSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique' });

/*To use our schema definition, we need to convert our
usuarioSchema into a Model we can work with.
To do so, we pass it into mongoose.model(modelName, schema):*/

module.exports = mongoose.model('Usuario', usuarioSchema);