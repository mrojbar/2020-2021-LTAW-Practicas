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
const ERROR404 = fs.readFileSync('404.html', 'utf-8');
const LOGIN = fs.readFileSync('login.html', 'utf-8');
const LOGINOK = fs.readFileSync('loginok.html', 'utf-8');
const CHECKOUT = fs.readFileSync('checkout.html', 'utf-8');
const CHECKOUTOK = fs.readFileSync('checkoutok.html', 'utf-8');

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

  //-- Funcion leer cookies, devuelve la cookie pedida o null si no existe
  function get_cookie(req, cookiename) {
    let cookievalor = null;
    const cookie = req.headers.cookie;
    if (cookie) {
      let pares = cookie.split(";");
      //-- Recorrer todos los pares nombre-valor
      pares.forEach((element) => {
        //-- Obtener los nombres y valores por separado
        let [nombre, valor] = element.split('=');
        //-- Leer el nombre de la cookie especificada
        if (nombre.trim() === cookiename) {
          cookievalor = valor;
        }
      });
      return cookievalor || null; //-- devolver null si no existe
    }
  }

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

    if (recurso == '/productos') {// caso de acceso a productos
      mime = "application/json";
      datagen = JSON.stringify(tienda[1]["products"]);
    }

    else if (recurso == '/login') {
      mime = "text/html"
      datagen = LOGIN;
    }

    else if (recurso == '/checkout') {
      mime = "text/html"
      datagen = CHECKOUT.replace("HTML_EXTRA", "");
    }

    else if (recurso.startsWith("/procesarlogin")) {
      mime = "text/html"
      foundflag = false;
      let username = url.searchParams.get('nombre');
      let realname = "";
      tienda[2]["users"].forEach((element, index) => {
        if (element.username == username){
          foundflag = true; //-- el usuario existe en la base de datos
          realname = element.fullname;
        }
      });
      if (foundflag) {
        datagen = LOGINOK.replace("HTML_EXTRA", "<h3>LOGIN CORRECTO. Bienvenido/a de nuevo: " + realname + "</h3>");
        res.setHeader('Set-Cookie', "username=" + username); //-- generar cookie de login
        console.log("login de: " + get_cookie(req, "username"));
      }
      else datagen = LOGIN;
    }

    else if (recurso.startsWith("/logout")){
      res.setHeader('Set-Cookie', "username="); //-- borrar cookie de login
      datagen = LOGINOK.replace("HTML_EXTRA", "<h3>SE HA CERRADO LA SESIÓN. HASTA PRONTO</h3>");;
    }
    
    else if (recurso.startsWith("/procesarcheckout")) {
      mime = "text/html";
      let foundflag = false;
      let address = url.searchParams.get('address');
      let creditcard = url.searchParams.get('creditcard');
      let username = get_cookie(req, "username") //-- usuario actual
      let shoppinglist = ""; // -------- EJ COOKIES cambiar por carrito actual

      if (address == "" || creditcard == "") { // datos vacios
        console.log("DATOS VACIOS");
        datagen = CHECKOUT.replace("HTML_EXTRA", "<h3>NO SE PUEDE PROCEDER: HAY DATOS VACÍOS</h3>");
      }
      else if (username == null) { // no ha inicado sesion
        datagen = CHECKOUT.replace("HTML_EXTRA", "<h3>DEBE INICIAR SESION PRIMERO PARA PODER REALIZAR LA COMPRA</h3>");
      }
      else {
        console.log("Direccion: " + address + " Tarjeta: " + creditcard);

        tienda[0]["orders"].forEach((element, index) => { // ----------- cambiar username por el actual cookies.
          if (element.username == username) { // comprobar si ya hay un pedido y sustituir.
            element.address = address;
            element.creditcard = creditcard;
            element.shoppinglist = shoppinglist; // ---------- cambiar cookies
            foundflag = true;
          }
        });
        if (!foundflag) {
          let neworder = {
            "username": username, // ---------- cambiar cookies
            "address": address,
            "creditcard": creditcard,
            "shoppinglist": shoppinglist // ----------- cambiar cookies
          }
          tienda[0]["orders"].push(neworder); // meter nuevo pedido
        }
        // -- escribir archivo json
        console.log(JSON.stringify(tienda[0]["orders"])); ////// -- debug
        fs.writeFileSync("tiendaout.json", JSON.stringify(tienda));
        datagen = CHECKOUTOK;
      }
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