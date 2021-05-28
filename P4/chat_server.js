//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const ip = require('ip');
const process = require('process');
const electron = require('electron');

const PUERTO = 9000;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asociado a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

let num_users = 0;
const str_server = '<p style="color:red;">Server: </p>';
const str_user = '<p style="color:grey;">User: </p>'
var d = new Date();

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal
let win = null;

//-- variables de info para electron
let node_version = process.versions.node;
let electron_version = process.versions.electron;
let chrome_version = process.versions.chrome;

let ip_addr = ip.address();
let ui = "chat.html"

let arquitectura = process.arch;
let plataforma = process.platform;


//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  res.send('Bienvenido a mi chat' + '<p><a href="public/chat.html">Chat</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname + '/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  num_users++;
  win.webContents.send('num_users', num_users); // Electron Render
  win.webContents.send('message', str_user + "Un nuevo usuario se ha unido al chat" + "<br>"); // Electron Render

  console.log('** NUEVA CONEXION. '.yellow + num_users + ' USUARIOS**'.yellow);
  msg = str_server + 'Hola, bienvenido al chat :)<br>';
  socket.send(msg);
  io.send(str_server + "Un nuevo usuario se ha unido al chat" + "<br>");

  //-- Evento de desconexión
  socket.on('disconnect', function () {
    num_users--;
    console.log('** CONEXION TERMINADA.  '.yellow + num_users + ' USUARIOS**'.yellow);
    io.send(str_server + "Un usuario abandonó el chat" + "<br>");

    win.webContents.send('num_users', num_users); // Electron Render
    win.webContents.send('message', str_user + "Un usuario abandonó el chat" + "<br>"); // Electron Render
  });

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg) => {
    //-- Enviar mensajes al chat
    console.log("Mensaje Recibido!: " + msg.blue);
    win.webContents.send('message', str_user + msg + "<br>"); // Electron Render, el server lo ve todo.

    // comandos especiales
    if (msg.startsWith("/")) {

      //-- Mostrar ayuda
      if (msg == "/help") {
        msg = str_server + "<br>" +
          "/help: mostrar la ayuda<br>" +
          "/list: mostrar el numero de usuarios conectados<br>" +
          "/hello: el server devuelve un saludo<br>" +
          "/date: el server devuelve la fecha" + "<br>";
        socket.send(msg);
        return;
      }

      //-- Mostrar usuarios conectados
      else if (msg == "/list") {
        msg = str_server + 'hay ' + num_users + ' usuarios conectados en este momento<br>';
        socket.send(msg);
        return;
      }

      else if (msg == "/hello") {
        msg = str_server + 'Hola :)<br>';
        socket.send(msg);
        return;
      }

      else if (msg == "/date") {
        msg = str_server + 'Fecha: ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + '-' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '<br>';
        socket.send(msg);
        return;
      }

      else {
        msg = str_server + msg + ' Es un comando desconocido. escribe /help para recibir la lista de comandos.<br>';
        socket.send(msg);
        return;
      }
    }
    else {
      //-- Reenviarlo a todos los clientes conectados
      io.send(str_user + msg + "<br>");
    }
  });

});

//-- Lanzar el servidor HTTP
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);

//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', () => {
  console.log("Electron Ready!".blue);

  //-- Crear la ventana principal de nuestra aplicación
  win = new electron.BrowserWindow({
    width: 1000,   //-- Anchura 
    height: 900,  //-- Altura

    //-- Permitir que la ventana tenga ACCESO AL SISTEMA
    webPreferences: { //---------------------------------- AQUI Permitir que la ventana tenga ACCESO AL SISTEMA
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  //-- En la parte superior se nos ha creado el menu
  //-- por defecto
  //-- Si lo queremos quitar, hay que añadir esta línea
  win.setMenuBarVisibility(false)

  //-- Cargar interfaz gráfica en HTML
  win.loadFile(ui);

  // enviar datos cuando la pagina de Chat esté lista en el render.
  win.on('ready-to-show', () => {
    let data = [num_users, node_version, electron_version, chrome_version, ip_addr,
      ui, PUERTO, arquitectura, plataforma];
    win.webContents.send('data', data); // Electron Render
    console.log("Electron datos enviados: ".blue + data)
  });

});

// proceso Main de Electron escuchando mensajes del Render.
electron.ipcMain.handle('test_button', (event, msg) => {
  io.send(str_server + msg);
});