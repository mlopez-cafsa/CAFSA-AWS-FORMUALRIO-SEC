# Guía de seguridad para publicación en AWS

## 1. Confirmación sobre el error `file://`

El error reportado se presenta cuando el sitio se abre directamente desde el explorador de archivos del equipo, por ejemplo:

```text
file:///C:/Users/.../index.html
```

Los navegadores modernos tratan los archivos locales bajo `file://` como orígenes opacos o aislados. Por eso pueden bloquear navegación, carga o interacción entre archivos aunque estén en la misma carpeta.

En AWS Amplify Hosting o CloudFront el sitio se entrega por `https://`, por lo que ese error específico de `file://` no debería presentarse, siempre que:

- Todos los archivos estén publicados en la misma estructura de carpetas.
- Las rutas sigan siendo relativas: `css/styles.css`, `js/app.js`, `assets/logo-cafsa.png`.
- El endpoint de envío del formulario sea HTTPS.
- La política CSP permita únicamente los dominios autorizados.

Para pruebas locales use un servidor HTTP local, no doble clic sobre `index.html`.

## 2. Prueba local recomendada

Desde la raíz del proyecto:

```bash
python -m http.server 8080
```

Luego abrir:

```text
http://localhost:8080
```

También puede usar:

```bash
npx serve .
```

## 3. Encabezados de seguridad incluidos

El archivo `customHttp.yml` incluye encabezados recomendados para AWS Amplify Hosting:

- `Strict-Transport-Security`: exige uso de HTTPS.
- `Content-Security-Policy`: limita scripts, estilos, imágenes, formularios y conexiones.
- `X-Content-Type-Options`: evita interpretación incorrecta de MIME types.
- `X-Frame-Options`: reduce riesgo de clickjacking.
- `Referrer-Policy`: limita exposición de URLs de origen.
- `Permissions-Policy`: deshabilita permisos no requeridos como cámara, micrófono, geolocalización y pagos.
- `Cross-Origin-Opener-Policy` y `Cross-Origin-Resource-Policy`: endurecen aislamiento entre orígenes.

## 4. Recomendaciones para backend seguro

Este proyecto es frontend estático. Para recibir documentos de identificación y datos personales, no se recomienda procesar ni almacenar información sensible únicamente en el navegador.

Arquitectura recomendada:

1. AWS Amplify Hosting o CloudFront para el frontend.
2. Amazon API Gateway con HTTPS para recepción de solicitudes.
3. AWS Lambda para validación y procesamiento.
4. Amazon S3 privado para documentos, con cifrado SSE-KMS.
5. DynamoDB o base de datos aprobada para metadatos mínimos necesarios.
6. AWS WAF asociado a CloudFront o API Gateway.
7. CloudTrail, CloudWatch Logs y alarmas para trazabilidad.
8. IAM con mínimo privilegio.
9. Secrets Manager o Parameter Store para secretos del backend.

## 5. Controles mínimos para datos personales

- Validar tipo, tamaño y contenido real del archivo en el backend; no confiar solo en la extensión `.pdf`.
- Aplicar antivirus o análisis de malware a documentos cargados.
- No guardar documentos en buckets públicos.
- Activar bloqueo de acceso público en S3.
- Usar cifrado administrado por KMS para documentos sensibles.
- Registrar auditoría de acceso a documentos.
- Definir retención y eliminación segura de archivos.
- No colocar tokens, llaves privadas ni credenciales en `config.js`.
- Restringir CORS al dominio oficial del formulario.
- Revisar CSP al configurar el dominio real del API.

## 6. Configuración del endpoint

Cuando el backend esté listo, actualizar `js/config.js`:

```javascript
window.CAFSA_FORM_CONFIG = Object.freeze({
  API_ENDPOINT: 'https://api.ejemplo.cafsa.fi.cr/solicitudes',
  MAX_FILE_MB: 10,
  DEMO_MODE: false
});
```

Y ajustar en `customHttp.yml` la directiva `connect-src` para permitir únicamente ese dominio.
