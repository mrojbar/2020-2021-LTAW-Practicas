const http = require('http');
const url = require('url');
const fs = require('fs');
const PUERTO = 9000;
let count = 0;
let CABECERAS = false;

//-- Configurar y lanzar el servidor.

http.createServer((req, res) => {
  count++;
  console.log("");
  console.log("----------> Peticion recibida")
  console.log("======================");
  console.log("Mensaje de solicitud " + count);
  console.log("Método: " + req.method);
  console.log("Version: " + req.httpVersion)
  if (CABECERAS) {
    console.log("Cabeceras: ");
    for (hname in req.headers)
      console.log(`  * ${hname}: ${req.headers[hname]}`);
  }

  //-- Construir el objeto url con la url de la solicitud
  const q = new URL(req.url, 'http://' + req.headers['host']);
  console.log("URL completa: " + q.href);
  console.log("Recurso:" + q.pathname);
  console.log("Host: " + q.host);

  let filename = ""
  let recurso = ""
  let tipostr = ""
  let mime = "text/"

  // -- Contar slash
  var nSlash = (q.pathname.match(new RegExp("/", "g")) || []).length;
  //var nSlashDoble = (q.href.match(new RegExp("//", "g")) || []).length;

  // -- Obtener el tipo de archivo
  if (q.pathname.includes('.')) {
    tipostr = q.pathname.substring(q.pathname.lastIndexOf('.') + 1); //quedarse con lo que hay detras del punto
  } else {
    tipostr = ""; //tipo por defecto
  }
  console.log("Tipo: " + tipostr);

  // -- Recurso y Mime ------------------- mejorar.
  if (nSlash > 1) {
    recurso = "." + q.pathname
    mime = mime + tipostr
  } else {
    if (tipostr == "" && q.pathname == "/") {
      mime = "text/html"
      filename += "index.html"
    } else {
      mime = mime + tipostr
    }
    recurso = q.pathname.slice(q.pathname.lastIndexOf("/") + 1)
  }

  filename += recurso;
  console.log("Slash contados: " + nSlash);
  console.log("Filename: " + filename);
  console.log("Mime: " + mime);

  //-- Leer fichero, data es el contenido del fichero leido
  fs.readFile(filename, function (err, data) {
    //-- Fichero no encontrado. Devolver mensaje de error
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end("404 Not found");
    }
    else {
      //-- Generar el mensaje de respuesta
      res.writeHead(200, { 'Content-Type': mime });
      res.write(data);
      res.end();
    }
    console.log("");
    console.log("======================");
    console.log("Mensaje de respuesta " + count);
    console.log("Respuesta: " + res.statusCode);
  });

}).listen(PUERTO);

console.log("Servidor corriendo...")
console.log("Puerto: " + PUERTO)