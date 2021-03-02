const fs = require('fs');

//-- Fichero a leer
const FICHERO = 'fich1.txt';

try {
  const data = fs.readFileSync(FICHERO, 'utf8'); //control de error con trycatch
  console.log("Lectura completada...")
  console.log("Contenido del fichero: \n")
  console.log(data);

} catch (err) {
  console.log("Error!!")
  console.log(err.message);
}