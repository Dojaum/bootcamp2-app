FROM nginx:alpine

LABEL description="PokeBusca Etapa 02 - Nginx com Supabase"

COPY index.html style.css script.js /usr/share/nginx/html/

EXPOSE 80
