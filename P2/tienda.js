const http = require('http');
const url = require('url');
const fs = require('fs');
const PUERTO = 9000;
let count = 0;
let CABECERAS = false;
const FICHERO_JSON = "tienda.json";
const tienda_json = fs.readFileSync(FICHERO_JSON);
const tienda = JSON.parse(tienda_json); // objeto tienda javascript

// -- Objetos generados.
const LOGIN = fs.readFileSync('login.html', 'utf-8');
const ERROR404 = fs.readFileSync('404.html', 'utf-8');
const LOGINOK = fs.readFileSync('loginok.html', 'utf-8');
const CHECKOUT = fs.readFileSync('checkout.html', 'utf-8');

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
    tipostr = recurso.substring(recurso.lastIndexOf('.') + 1); //quedarse con lo que hay detras del punto
  } else {
    tipostr = ""; //tipo por defecto
  }
  console.log("Tipo: " + tipostr);

  // -- Nombre de recurso y Mime

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

  // -------- Recurso dinámico sin extension (menos recurso por defecto): Generar recurso.
  if (tipostr == "" && recurso != "/") {
    let datagen = ""; // datos generados.

    if (recurso == '/productos') {//devuelveJsonProductos(res); // caso de acceso a productos
      mime = "application/json";
      datagen = JSON.stringify(tienda[1]["products"]);
    }

    else if (recurso == '/login') {
      mime = "text/html"
      datagen = LOGIN;
    }

    else if (recurso == '/checkout') {
      mime = "text/html"
      datagen = CHECKOUT;
    }

    else if (recurso.startsWith("/procesarlogin")) {
      mime = "text/html"
      foundflag = false;
      username = url.searchParams.get('nombre');
      console.log("User: " + username);

      tienda[2]["users"].forEach((element, index) => {
        if (element.username == username) foundflag = true; //////////////////continuar cookies aqui
      });
      if (foundflag) {
        datagen = LOGINOK;
      }
      else datagen = LOGIN;
    }

    else if (recurso.startsWith("/procesarcheckout")) {
      mime = "text/html"
      foundflag = false;
      address = url.searchParams.get('address');
      creditcard = url.searchParams.get('creditcard');
      if (address == "" || creditcard == ""){
        console.log("Hay datos vacios!");
        datagen = CHECKOUT; // redirigir
        return; // salir si datos son null.
      }
      console.log("sigue")
      username = "elpatata" //-------- EJ COOKIES cambiar por usuario actual
      //shoppinglist = // -------- EJ COOKIES cambiar por carrito actual
      console.log("Direccion: " + address + " Tarjeta: " + creditcard);

      tienda[0]["orders"].forEach((element, index) => { // ----------- cambiar username por el actual cookies.
        if (element.username == username) { // comprobar si ya hay un pedido y sustituir.
          element.address = address;
          element.creditcard = creditcard;
          element.shoppinglist = "chungo"
          foundflag = true;
        }
      });
      if (!foundflag) {
        let neworder = {
          "user": username, // ---------- cambiar cookies
          "dirección": address,
          "tarjeta": creditcard,
          "shoppinglist": "listadeproductosaqui" // ----------- cambiar cookies
        }
        tienda[0]["orders"].push(neworder); // meter nuevo pedido
      }
      // -- escribir archivo json
      console.log(JSON.stringify(tienda)); ////// -- debug
      fs.writeFileSync("tiendaout.json", JSON.stringify(tienda));
    }

    else { // -- Si el recurso no existe
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(ERROR404);
    }

    // -- El recurso existe: escribir recurso generado.
    res.writeHead(200, { 'Content-Type': mime });
    res.write(datagen);
    res.end();
  }

  //-------- Recurso fichero: Leer fichero, data es el contenido del fichero leido
  else {
    fs.readFile(filename, function (err, data) {

      //-- Fichero no encontrado. Devolver mensaje de error
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(ERROR404);
      }
      else {
        //-- Generar el mensaje de respuesta
        res.writeHead(200, { 'Content-Type': mime });
        res.write(data);
        res.end();
      }
    });
    console.log("");
    console.log("======================");
    console.log("Mensaje de respuesta " + count);
    console.log("Slash contados: " + nSlash);
    console.log("Filename: " + filename);
    console.log("Mime: " + mime);
    console.log("Respuesta: " + res.statusCode);

  }

}).listen(PUERTO);

console.log("Servidor corriendo...")
console.log("Puerto: " + PUERTO)