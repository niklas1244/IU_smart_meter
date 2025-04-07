FROM python:3.11
WORKDIR /app

# Prerequisites
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends apache2 libapache2-mod-wsgi-py3 curl openssl && \
    rm -rf /var/lib/apt/lists/* && \
    a2enmod proxy proxy_http rewrite headers ssl

# Flask app
COPY ./flask_app/requirements.txt /app/flask_app/requirements.txt
RUN pip install --no-cache-dir -r /app/flask_app/requirements.txt
COPY ./flask_app /app/flask_app

COPY certs /certs
RUN chmod 644 /certs/*

# Frontend
COPY ./frontend/dist /var/www/html
COPY ./apache-flask.conf /etc/apache2/sites-available/000-default.conf

# Create self-signed cert
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/selfsigned.key -out /etc/ssl/certs/selfsigned.crt \
    -subj "/CN=localhost"

EXPOSE 80 443

CMD ["sh", "-c", "service apache2 start && python3 /app/flask_app/app.py"]
