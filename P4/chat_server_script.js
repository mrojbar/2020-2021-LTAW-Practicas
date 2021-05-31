const electron = require('electron');
const QRCode = require('qrcode')

//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const num_users = document.getElementById("num_users");
const node_version = document.getElementById("node_version");
const electron_version = document.getElementById("electron_version");
const chrome_version = document.getElementById("chrome_version");
const ip = document.getElementById("ip");
const arch = document.getElementById("arch");
const plat = document.getElementById("plat");
const test_button = document.getElementById("test_button");

//-- Renderer de Electron esperando a eventos.
//-- Evento de numero de usuarios
electron.ipcRenderer.on('num_users', (event, message) => {
  num_users.textContent = message;
});

//-- Evento de datos de sistema e info.
electron.ipcRenderer.on('data', (event, message) => {
  num_users.textContent = message[0];
  node_version.textContent = message[1];
  electron_version.textContent = message[2];
  chrome_version.textContent = message[3];
  //var URLclientes = "http://" + message[4] +":"+ message[6] +"/public/"+ message[5];
  var URLclientes = "http://" + message[4] +":"+ message[6] +"/public/"+ message[5];
  ip.textContent = URLclientes;

  // generador de código QR (Mejora opcional)
  QRCode.toDataURL(URLclientes, function (err, url) {
    var QRimage = document.getElementById('QRimage')
    QRimage.src = url;
  })
  
  arch.textContent = message[7];
  plat.textContent = message[8];
});

electron.ipcRenderer.on('message',(event, message) =>{
  display.innerHTML += '<p>' + message + '</p>';
});

// -- boton de test
test_button.onclick = () => {
  let button_message = "<p>---Mensaje de test desde el server!---</p><br>";
  display.innerHTML += button_message;
  //-- Enviar mensaje al proceso principal
  electron.ipcRenderer.invoke('test_button', button_message);
}

// -- Opcion para que el server envie mensajes globales.
msg_entry.onchange = () => {
  let msg_server = "<p>"+msg_entry.value+"</p><br>";
  if (msg_entry.value){
    display.innerHTML += msg_server;
    electron.ipcRenderer.invoke('test_button', msg_server);
  }
  //-- Borrar el mensaje actual
  msg_entry.value = "";
}