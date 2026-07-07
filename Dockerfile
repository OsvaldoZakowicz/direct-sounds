FROM nginx:1.27-alpine

# nginx sirve archivos estaticos por defecto desde esta carpeta
# no hace falta configuracion adicional porque el proyecto no tiene rutas del lado del cliente
COPY . /usr/share/nginx/html

EXPOSE 80
