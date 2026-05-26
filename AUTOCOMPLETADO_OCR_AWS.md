# Autocompletado OCR

El formulario ya incluye el flujo técnico para:

1. Seleccionar o arrastrar un PDF.
2. Validar extensión, MIME type y tamaño.
3. Convertir el archivo a Base64.
4. Invocar un endpoint OCR configurado.
5. Mapear la respuesta a los campos del formulario.

## Campos esperados

El frontend soporta distintas variantes de nombres de campo. Las principales son:

```json
{
  "numero_cedula": "123456789",
  "nombre": "MARIA",
  "primer_apellido": "LOPEZ",
  "segundo_apellido": "ROJAS",
  "fecha_vencimiento": "07-01-2030"
}
```

También acepta formato camelCase:

```json
{
  "numeroIdentificacion": "1-2345-6789",
  "nombre": "MARIA",
  "primerApellido": "LOPEZ",
  "segundoApellido": "ROJAS",
  "fechaVencimientoDocumento": "2030-01-07"
}
```

## Activación

En ambiente público no se recomienda habilitar OCR directo desde el navegador. Para pruebas controladas, configure `OCR_SERVICE_URL` y `ENABLE_DIRECT_OCR: true`, pero no suba esa configuración a GitHub público.
