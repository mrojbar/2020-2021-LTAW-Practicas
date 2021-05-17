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
const INDEX = fs.readFileSync('index.html', 'utf-8');
const CAP = fs.readFileSync('cap.html', 'utf-8');
const NIKE = fs.readFileSync('nike.html', 'utf-8');
const BOARD = fs.readFileSync('board.html', 'utf-8');

const ERROR404 = fs.readFileSync('404.html', 'utf-8');
const LOGIN = fs.readFileSync('login.html', 'utf-8');
const LOGINOK = fs.readFileSync('loginok.html', 'utf-8');
const CHECKOUT = fs.readFileSync('checkout.html', 'utf-8');
const CHECKOUTOK = fs.readFileSync('checkoutok.html', 'utf-8');

const shoppinglist = {
  name: "",
  quantity: ""
}

let orderslistNAME = []; //-- lista de pedidos de cada objeto unico
let orderslistNUM = []; //-- lista de numero de pedidos de cada objeto unico
let ordersobject = []; //objeto lista de la compra
let ordersobjectlist = []; //lista de objetos de la lista de la compra

let prodarray = [];

//-- funcion que crea un json con los productos de la tienda
function get_json_prods(tienda, prodarray) {
  tienda[1]["products"].forEach((element) => {
    prodarray.push(element.name);
  });
  return JSON.stringify(prodarray);
}

let jsonprods = get_json_prods(tienda, prodarray);

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

  console.log("Filename: " + filename);

  // -------- Recurso dinámico sin extension (menos recurso por defecto): Generar recurso.
  if (tipostr == "") {

    let datagen = ""; // datos generados.
    let realname = "";

    if (recurso == '/' || recurso == '/index') {
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada    
        tienda[2]["users"].forEach((element, index) => {
          if (get_cookie(req, "username") == element.username) realname = element.fullname;
        });
        datagen = INDEX.replace("HTML_EXTRA", "<h1>Hola " + realname + " :)</h1>");
      }
      else {
        datagen = INDEX.replace("HTML_EXTRA", "");
      }
    }

    else if (recurso == '/cap') {
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada    
        tienda[2]["users"].forEach((element, index) => {
          if (get_cookie(req, "username") == element.username) realname = element.fullname;
        });
        datagen = CAP.replace("HTML_EXTRA", "<h1>Hola " + realname + " :)</h1>");
      }
      else {
        datagen = CAP.replace("HTML_EXTRA", "");
      }
    }

    else if (recurso == '/buycap') {
      let orders = get_cookie(req, "shoppinglist");
      if (orders == null) orders = "";
      res.setHeader('Set-Cookie', "shoppinglist=" + orders + "Gorra:");
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada    
        tienda[2]["users"].forEach((element, index) => {
          if (get_cookie(req, "username") == element.username) realname = element.fullname;
        });
        datagen = CAP.replace("HTML_EXTRA", "<h1>Hola " + realname + " :)</h1>");
      }
      else {
        datagen = CAP.replace("HTML_EXTRA", "");
      }
    }

    else if (recurso == '/board') {
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada    
        tienda[2]["users"].forEach((element, index) => {
          if (get_cookie(req, "username") == element.username) realname = element.fullname;
        });
        datagen = BOARD.replace("HTML_EXTRA", "<h1>Hola " + realname + " :)</h1>");
      }
      else {
        datagen = BOARD.replace("HTML_EXTRA", "");
      }
    }

    else if (recurso == '/buyboard') {
      let orders = get_cookie(req, "shoppinglist");
      if (orders == null) orders = "";
      res.setHeader('Set-Cookie', "shoppinglist=" + orders + "Hoverbaord:");
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada    
        tienda[2]["users"].forEach((element, index) => {
          if (get_cookie(req, "username") == element.username) realname = element.fullname;
        });
        datagen = BOARD.replace("HTML_EXTRA", "<h1>Hola " + realname + " :)</h1>");
      }
      else {
        datagen = BOARD.replace("HTML_EXTRA", "");
      }
    }

    else if (recurso == '/nike') {
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada    
        tienda[2]["users"].forEach((element, index) => {
          if (get_cookie(req, "username") == element.username) realname = element.fullname;
        });
        datagen = NIKE.replace("HTML_EXTRA", "<h1>Hola " + realname + " :)</h1>");
      }
      else {
        datagen = NIKE.replace("HTML_EXTRA", "");
      }
    }

    else if (recurso == '/buynike') {
      let orders = get_cookie(req, "shoppinglist");
      if (orders == null) orders = "";
      res.setHeader('Set-Cookie', "shoppinglist=" + orders + "Zapatillas:");
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada    
        tienda[2]["users"].forEach((element, index) => {
          if (get_cookie(req, "username") == element.username) realname = element.fullname;
        });
        datagen = NIKE.replace("HTML_EXTRA", "<h1>Hola " + realname + " :)</h1>");
      }
      else {
        datagen = NIKE.replace("HTML_EXTRA", "");
      }
    }

    else if (recurso == '/productos') {// caso de acceso a productos
      mime = "application/json";
      datagen = get_json_prods(tienda, prodarray);
    }

    else if (recurso == '/busqueda') {
      mime = "application/json";
      console.log("JSONPRODS: " + jsonprods);
      //-- Leer los parámetros
      let param = url.searchParams.get('param');
      param = param.toUpperCase();

      console.log("  Param: " + param);
      let result = [];

      for (let prod of JSON.parse(jsonprods)) {
        //-- Pasar a mayúsculas
        prodU = prod.toUpperCase();
        //-- Si el producto comienza por lo indicado en el parametro
        //-- meter este producto en el array de resultados
        console.log(prodU);
        if (prodU.startsWith(param)) {
          result.push(prod);
        }
      }

      console.log(result);
      datagen = JSON.stringify(result);
    }

    else if (recurso == '/login') {
      mime = "text/html"
      if (get_cookie(req, "username") != null) { //-- ya hay una sesion iniciada
        datagen = LOGINOK.replace("HTML_EXTRA", "<h3>Cierra la sesión actual antes de abrir una nueva sesión.</h3>");
      }
      else { //-- no hay sesion iniciada
        datagen = LOGIN.replace("HTML_EXTRA", "");;
      }
    }

    else if (recurso == '/checkout') {

      orderslistNAME = []; //-- vaciar las listas.
      orderslistNUM = [];
      ordersobjectlist = [];
      stringcarrito = "";
      mime = "text/html"

      if (get_cookie(req, "shoppinglist") == null) {
        datagen = datagen = CHECKOUTOK.replace("HTML_EXTRA", "<h3>CHECKOUT INCORRECTO.</h3><p>Debe tener objetos en el carrito.</p>");
      }
      else {
        let orderslist = get_cookie(req, "shoppinglist").split(":"); //-- lee la cookie de los pedidos.
        orderslist.pop(); // quitar el : del final.
        let stringcarrito = '';
        orderslist.forEach((element, index) => { //-- busca elementos repetidos en el array
          if (orderslistNAME.includes(element)) {
            orderslistNUM[orderslistNAME.indexOf(element)]++;
          }
          else {
            orderslistNAME[index] = element;
            orderslistNUM[index] = 1;
          }
        });
        console.log(orderslistNAME);
        console.log(orderslistNUM);
        orderslistNAME.forEach((element, index) => {
          ordersobject = Object.create(shoppinglist); //-- crear nuevo objeto de producto pedido
          ordersobject.name = element; //-- asignar el nombre del producto al objeto
          ordersobject.quantity = orderslistNUM[index]; // numero de productos
          ordersobjectlist.push(ordersobject); //-- meter objeto en la lista de objetos
          stringcarrito = stringcarrito + element + "&emsp;Cantidad:&emsp;" + orderslistNUM[index] + "<br>"; //-- texto resumen del pedido
          console.log(stringcarrito); ///////////
        });
        console.log(ordersobjectlist);// -- lista de pedidos.
        datagen = CHECKOUT.replace("HTML_EXTRA", "");
        datagen = datagen.replace("HTML_CARRITO", stringcarrito); ///////////////// meter aqui una lista legible de cosas.
      }
    }

    else if (recurso.startsWith("/procesarlogin")) {
      mime = "text/html"
      foundflag = false;
      let username = url.searchParams.get('nombre');
      realname = "";
      tienda[2]["users"].forEach((element, index) => {
        if (element.username == username) {
          foundflag = true; //-- el usuario existe en la base de datos
          realname = element.fullname;
        }
      });
      if (foundflag) {
        datagen = LOGINOK.replace("HTML_EXTRA", "<h3>LOGIN CORRECTO. Bienvenido/a de nuevo: " + realname + "</h3>");
        res.setHeader('Set-Cookie', "username=" + username); //-- generar cookie de login
        console.log("login de: " + get_cookie(req, "username"));
      }
      else datagen = LOGIN.replace("HTML_EXTRA", "<h3>LOGIN INCORRECTO</h3>");
    }

    else if (recurso.startsWith("/logout")) {
      res.setHeader('Set-Cookie', ["shoppinglist=", "username="]); //-- borrar cookies
      datagen = LOGINOK.replace("HTML_EXTRA", "<h3>SE HA CERRADO LA SESIÓN. HASTA PRONTO</h3>");
    }

    else if (recurso.startsWith("/procesarcheckout")) {
      mime = "text/html";
      let foundflag = false;
      let address = url.searchParams.get('address');
      let creditcard = url.searchParams.get('creditcard');
      let username = get_cookie(req, "username") //-- usuario actual
      let shoppinglist = ordersobjectlist; // -------- COMPROBAR SI ESTA VACIO PARA ABORTAR.
      console.log(ordersobject);

      if (address == "" || creditcard == "") { // datos vacios
        console.log("DATOS VACIOS");
        datagen = CHECKOUT.replace("HTML_EXTRA", "<h3>NO SE PUEDE PROCEDER: HAY DATOS VACÍOS</h3>");
        datagen = datagen.replace("HTML_CARRITO", "")
      }
      else if (username == null) { // no ha inicado sesion
        datagen = CHECKOUT.replace("HTML_EXTRA", "<h3>DEBE INICIAR SESION PRIMERO PARA PODER REALIZAR LA COMPRA</h3>");
        datagen = datagen.replace("HTML_CARRITO", "")
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
        fs.writeFileSync(FICHERO_JSON, JSON.stringify(tienda));
        res.setHeader('Set-Cookie', "shoppinglist="); //-- borrar carrito
        datagen = CHECKOUTOK.replace("HTML_EXTRA", "<h3>CHECKOUT CORRECTO.</h3><p>Pueve volver a la página principal.</p>");
      }
    }

    else { // -- Si el recurso no existe
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(ERROR404);
      return; // -- return evitar write after end
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
        return;
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