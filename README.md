# CAFSA-AWS-FORMUALRIO-SEC

Proyecto actualizado del formulario de actualización de datos de Grupo Financiero CAFSA S.A.

## Qué incluye

- `index.html` modernizado y alineado a accesibilidad.
- `css/styles.css` con tonalidad clara corporativa y logo CAFSA.
- `js/app.js` integrado con validación, carga PDF, OCR/autocompletado, llenado manual y envío.
- `js/location-data.js` con dinámica provincia/cantón/distrito.
- `js/config.js` con configuración pública segura.
- Pruebas Jest en `tests/`.
- `customHttp.yml` y `amplify.yml` para AWS Amplify Hosting.

## Prueba local

No abra el archivo con doble clic porque `file://` limita el comportamiento del navegador. Ejecute:

## OCR / autocompletado

El archivo original `config.js` traía un endpoint de OCR directo con firma/token. En esta versión se dejó `OCR_SERVICE_URL` vacío por seguridad, porque el repositorio será público.

Para que el autocompletado funcione en ambiente controlado debe configurarse un endpoint seguro, idealmente:

```text
Frontend: AWS Amplify Hosting o CloudFront
Backend: API Gateway + Lambda
OCR: Amazon Textract o proxy controlado hacia Power Automate
Almacenamiento: S3 privado con cifrado
```

## Seguridad

No publique tokens, firmas de Power Automate, llaves AWS, SAS tokens ni credenciales dentro de `config.js`.
