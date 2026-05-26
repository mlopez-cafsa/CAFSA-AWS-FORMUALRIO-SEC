# Formulario de Actualización de Datos - CAFSA

Proyecto web estático actualizado para publicación en AWS, con imagen corporativa CAFSA, tonalidad clara, mejoras de accesibilidad y controles iniciales de seguridad frontend.

## Archivos principales

- `index.html`: estructura HTML del formulario.
- `css/styles.css`: estilos claros, responsivos y accesibles.
- `js/config.js`: configuración pública del endpoint del backend.
- `js/app.js`: interacción del formulario, carga de PDF, validación básica y envío.
- `assets/logo-cafsa.png`: logo institucional.
- `customHttp.yml`: encabezados de seguridad para AWS Amplify Hosting.
- `amplify.yml`: configuración simple de despliegue estático en Amplify.
- `SEGURIDAD_AWS.md`: guía de seguridad y recomendaciones para publicación.

## Confirmación sobre el error `file://`

El error `Unsafe attempt to load URL file:///...` corresponde a ejecución local mediante doble clic sobre `index.html`. Para pruebas debe usarse un servidor local HTTP.

```bash
python -m http.server 8080
```

Abrir:

```text
http://localhost:8080
```

Al publicarse en AWS Amplify Hosting o CloudFront bajo HTTPS, ese error específico de `file://` no debería presentarse.

## Publicación en AWS Amplify Hosting

1. Subir el contenido del proyecto al repositorio.
2. Confirmar que `customHttp.yml` esté en la raíz.
3. Confirmar que `amplify.yml` esté en la raíz si se usará despliegue CI/CD simple.
4. Publicar desde Amplify Hosting.
5. Configurar dominio oficial y certificado SSL/TLS.
6. Ajustar `js/config.js` con el endpoint real HTTPS del backend.
7. Ajustar `connect-src` en `customHttp.yml` al dominio real del API.

## Nota importante

El frontend no debe contener secretos, tokens ni credenciales. La recepción y almacenamiento de cédulas/documentos debe implementarse mediante backend seguro en AWS.
