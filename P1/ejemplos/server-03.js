const http = require('http');

//-- Definir el puerto a utilizar
const PUERTO = 8080;
//-- Contador de peticiones
let count = 0;
//-- Crear el servidor
const server = http.createServer((req, res) => {
    //-- req: http.IncomingMessage: Mensaje de solicitud
    //-- res: http.SercerResponse: Mensaje de respuesta (vacío)

    //-- almacena todos los parametros de la url solicitada por el cliente.
    const myURL = new URL(req.url, 'http://' + req.headers['host']);

    //-- Indicamos que se ha recibido una petición
    count++;
    console.log("Petición "+count+" "+req.method+" recibida!");
    console.log(myURL);

    //-- Cabecera que indica el tipo de datos del
    //-- cuerpo de la respuesta: Texto plano
    res.setHeader('Content-Type', 'text/plain');

    //-- Mensaje del cuerpo
    res.write("Soy el Happy server!!\n");

    //-- Terminar la respuesta y enviarla
    res.end();
});

//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);

console.log("Happy server activado!. Escuchando en puerto: " + PUERTO);