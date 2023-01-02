const express = require('express');
const app = express();
const mysql = require('mysql2');
// Motor de Plantillas
const hbs = require('hbs');
// Encontrar archivos
const path = require('path');
// Para enviar mails
const nodemailer = require('nodemailer');
// Variables de entorno
require('dotenv').config();

// Configuramos el puerto
const PORT = process.env.PORT

// Middelware funciones que dan info a json
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

// Configuramos el motor de plantillas de hbs
app.set('view engine', 'hbs');
//Configuramos la ubicacion de las plantillas
app.set('views', path.join(__dirname, 'views'));
//Configuramos los parciales de motores de plantillas
hbs.registerPartials(path.join(__dirname, 'views/partials'));



//Conexion a la Base de Datos
const conexion = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DBPORT

})

conexion.connect((err)=>{
    if (err) throw err;
    console.log(`Conectado a la Data Base: ${process.env.DATABASE}`);
})

// Rutas de la Aplicacion
app.get('/', (req, res) => {
    res.render('index', {
        titulo: 'Home'
    })
})

app.get('/formulario', (req, res) => {
    res.render('formulario')
})

app.get('/productos', (req, res) => {
    
    let sql = "SELECT * FROM productos";

    conexion.query(sql, function(err, result){
        if (err) throw err;
        //console.log(result);
        res.render('productos', {
            titulo: 'Productos',
            datos: result
        })
    })
})


app.get('/contacto', (req, res) =>{
    res.render('contacto', {
        titulo: 'Contacto'
    })
})

app.post('/formulario', (req, res) =>{    
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const descripcion = req.body.descripcion;

    let datos = {
        nombre: nombre,
        precio: precio,
        descripcion: descripcion
    }

    let sql = "INSERT INTO productos set ?";

    conexion.query(sql, datos, function(err){
        if (err) throw err;
            console.log(`1 Registro insertado`);
            res.render('enviado')
        })
})

app.post('/contacto', (req, res) =>{
    const nombre = req.body.nombre;
    const email = req.body.email;

    //Creamos una función para enviar Email al cliente
    async function envioMail(){
        //Configuramos la cuenta del envío­o
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAILPASSWORD
            }
        });

        //Enví­o del mail
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: `${email}`,
            subject: "Gracias por suscribirte a nuestra App",
            html:`Muchas gracias por visitar nuestra página <br>
            Recibirás nuestras promociones a esta dirrección de correo. <br>
            Buen fin de semana!!`
        })
    }

    let datos = {
        nombre: nombre,
        email: email
    }


    let sql = "INSERT INTO contactos set ?";

    conexion.query(sql, datos, function(err){
        if (err) throw err;
            console.log(`1 Registro insertado`);
            //Email
            envioMail().catch(console.error);
            res.render('enviado')
        })

})

//Servidor a la escucha de las peticiones
app.listen(PORT, ()=>{
    console.log(`Servidor tranajando en el Puerto: ${PORT}`);
})

