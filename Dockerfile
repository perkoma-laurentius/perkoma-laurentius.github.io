# Gunakan image Nginx
FROM nginx:alpine

# Salin file proyek ke dalam container
COPY . /usr/share/nginx/html

# Salin konfigurasi Nginx khusus
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80
