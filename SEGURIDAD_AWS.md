# Seguridad AWS y publicación pública

## Punto crítico detectado

El `config.js` original incluía un endpoint de OCR con firma de invocación. Ese tipo de URL permite ejecutar el flujo asociado y no debe publicarse en un repositorio público.

## Recomendación

- Mantener `OCR_SERVICE_URL` vacío en el frontend público.
- Exponer un endpoint propio con API Gateway + Lambda.
- Validar origen, método, tamaño, tipo MIME y extensión del PDF.
- Guardar documentos únicamente en S3 privado, con cifrado SSE-S3 o SSE-KMS.
- Usar URLs prefirmadas o carga controlada por backend.
- Activar AWS WAF si se publica detrás de CloudFront.
- Registrar auditoría básica: fecha, IP, user-agent, requestId y resultado.
- Aplicar CORS solo al dominio final de CAFSA, no `*`.
- No enviar secretos al navegador.

## CSP

El archivo `customHttp.yml` incluye una CSP conservadora. Si habilita OCR directo o un backend adicional, agregue el dominio requerido a `connect-src`.
