# Hub de eventos

## Guia rápida

1. Crear operacion GET /callback
Esta operación es peticionada por el hub para verificar la suscripción.
Recibe por query param: topic y challenge.
Debe responder http status 200 y devolver el valor del parámetro "challenge" que recibe por query param.
El hub lo usará para verificar que el endpoint es correcto.

Ejemplo de petición del hub al subscriptor
```bash
curl -X GET "http://host.docker.internal:3000/callback?topic=pedido.creado&challenge=123456789"
```
Este ejemplo realiza una petición GET al endpoint /callback
Incluye los parámetros de consulta requeridos:
topic=pedido.creado
challenge=123456789
El endpoint debe responder con un código de estado 200 y devolver el valor del reto «123456789».

2. Crear operación POST /callback
Esta operación es peticionada por el hub para recibir contenido.
Debe procesar el contenido y devolver un código 204 (No Content) para indicar que lo recibió correctamente.
Si no se puede procesar el contenido, debe devolver un código 200 (OK) para evitar reintentos.
El contenido se recibe en el cuerpo de la petición.
El hub enviará el contenido en formato JSON.

Ejemplo de petición del hub al subscriptor
```bash
curl -X POST "http://host.docker.internal:3000/callback" \
     -H "Content-Type: application/json" \
     -d '{
           "event": "pedido.creado",
           "data": {
             "orderId": "12345",
             "customer": {
               "name": "John Doe",
               "email": "john@example.com"
             },
             "items": [
               {
                 "productId": "A123",
                 "quantity": 2,
                 "price": 19.99
               }
             ]
           }
         }'
```
Este ejemplo hace una petición POST a /callback
Envía un cuerpo JSON con un evento pedido.creado de ejemplo

3. Por último deberas subscribirte mediante el portal del hub de eventos a algún topico utilizando tu URL de callback.
