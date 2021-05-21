//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 9000;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

let num_users = 0;
const str_server = '<p style="color:red;">Server: </p>';
const str_user = '<p style="color:grey;">User: </p>'

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  res.send('Bienvenido a mi chat' + '<p><a href="/chat.html">Chat</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  num_users++;
  console.log('** NUEVA CONEXIÓN. '.yellow +num_users+ ' USUARIOS**'.yellow);
  msg = str_server+'Hola, bienvenido al chat :)<br>';
  socket.send(msg);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    num_users--;
    console.log('** CONEXIÓN TERMINADA.  '.yellow +num_users+ ' USUARIOS**'.yellow);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    //-- Enviar mensajes al chat
    console.log("Mensaje Recibido!: " + msg.blue);

    //-- Mostrar ayuda
    if(msg == "/help"){
      msg = str_server+"<br>"+
      "/help: mostrar la ayuda<br>"+
      "/list: mostrar el numero de usuarios conectados<br>"+
      "/hello: el server devuelve un saludo<br>"+
      "/date: el server devuelve la fecha";
      socket.send(msg);
      return;
    }
    
    //-- Mostrar usuarios conectados
    if(msg == "/list"){
      msg = str_server+'hay '+num_users+' usuarios conectados en este momento<br>';
      socket.send(msg);
      return;
    }

    //-- Reenviarlo a todos los clientes conectados
    io.send(str_user+msg+"<br>");
  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);