
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