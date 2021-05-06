const http = require('http');
const url = require('url');
const fs = require('fs');
const PUERTO = 9000;
let count = 0;
let CABECERAS = false;
const FICHERO_JSON = "tienda.json";
const tienda_json = fs.readFileSync(FICHERO_JSON);
const tienda = JSON.parse(tienda_json); // objeto tienda javascript

//console.log(tienda[0]["orders"][0]["shoppinglist"][1]["name"]);
//-- Configurar y lanzar el servidor.

console.log("Productos en la tienda: " + tienda.length);

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
  const url = new URL(req.url, 'http://' + req.headers['host']);
  console.log("URL completa: " + url.href);
  console.log("Host: " + url.host);
  let filename = ""
  let recurso = url.pathname;
  console.log("Recurso:" + recurso);
  let tipostr = ""
  let mime = ""


  // -- Contar slash
  var nSlash = (recurso.match(new RegExp("/", "g")) || []).length;

  // -- Obtener el tipo de archivo
  if (recurso.includes('.')) {
    tipostr = recurso.substring(recurso.lastIndexOf('.') + 1); //urluedarse con lo urlue hay detras del punto
  } else {
    tipostr = ""; //tipo por defecto
  }
  console.log("Tipo: " + tipostr);

  // -- Recurso y Mime

  if (tipostr != "") { // recurso con extension: fichero
    if (tipostr == "gif" || tipostr == "jpg" || tipostr == "png") {
      mime += "image/" + tipostr;
    } else if (tipostr == "txt" || tipostr == "html" || tipostr == "css") {
      mime += "text/" + tipostr;
    } else if (tipostr == "ttf") {
      mime += "x-font-ttf";
    } else if (tipostr == "json") {
      mime += "application/"
    }
  } else { // recurso sin extension: directorio
    mime += "";
  }

  if (nSlash > 1) { // cambio de directorio
    filename = "." + recurso;
  } else { // directorio raiz
    if (recurso == "/") { // fichero por defecto
      filename = "index.html";
      mime += "text/html"
    } else {
      filename = recurso.slice(recurso.lastIndexOf("/") + 1); // ruta
    }
  }

  //-- Leer fichero, data es el contenido del fichero leido
  fs.readFile(filename, function (err, data) {
    if (recurso == '/productos') devuelveJsonProductos(res); // caso de acceso a productos
    //-- Fichero no encontrado. Devolver mensaje de error
    else if (err) {
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
    console.log("Slash contados: " + nSlash);
    console.log("Filename: " + filename);
    console.log("Mime: " + mime);
    console.log("Respuesta: " + res.statusCode);
  });

}).listen(PUERTO);

console.log("Servidor corriendo...")
console.log("Puerto: " + PUERTO)

function devuelveJsonProductos(res) { // acceso especial al json de la tienda mediante directorio /productos
  res.writeHead(200, { 'Content-Type': "application/json" });
  res.write(JSON.stringify(tienda[1]["products"]));
  res.end();
}