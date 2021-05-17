console.log("Ejecutando Cliente...");
//-- Elementos HTML para mostrar informacion
const display = document.getElementById("display");
//-- Caja de busqueda
const caja = document.getElementById("caja");
//-- Retrollamda del boton de Ver productos
caja.oninput = () => {
    //-- Crear objeto m para contener peticiones AJAX
    const m = new XMLHttpRequest();
    //-- Función de callback que se invoca cuando
    //-- hay cambios de estado en la petición
    m.onreadystatechange = () => {
        //-- Petición enviada y recibida. Todo OK!
        if (m.readyState == 4) {
            //-- Solo la procesamos si la respuesta es correcta
            if (m.status == 200) {
                //-- La respuesta es un objeto JSON
                let productos = JSON.parse(m.responseText)
                console.log(productos);
                //-- Borrar el resultado anterior
                display.innerHTML = "";
                //--Recorrer los productos del objeto JSON
                for (let i = 0; i < productos.length; i++) {
                    //-- Añadir cada producto al párrafo de visualización
                    if (productos[i] == "Gorra") {
                        display.innerHTML += '<a href="/cap">' + productos[i] + '</a>';
                    }
                    if (productos[i] == "Hoverboard") {
                        display.innerHTML += '<a href="/board">' + productos[i] + '</a>';
                    }
                    if (productos[i] == "Zapatillas") {
                        display.innerHTML += '<a href="/nike">' + productos[i] + '</a>';
                    }
                    //-- Separamos los productos por ',''
                    if (i < productos.length - 1) {
                        display.innerHTML += ', ';
                    }
                }
            } else {
                //-- Hay un error en la petición
                //-- Lo notificamos en la consola y en la propia web
                console.log("Error en la petición: " + m.status + " " + m.statusText);
                display.innerHTML += '<p>ERROR</p>'
            }
        }
    }
    console.log(caja.value.length);
    //-- La peticion se realiza solo si hay al menos 3 carácteres
    if (caja.value.length >= 3) {
        //-- Configurar la petición
        m.open("GET", "/busqueda?param=" + caja.value, true);
        //-- Enviar la petición!
        m.send();
    } else {
        display.innerHTML = "";
    }
}