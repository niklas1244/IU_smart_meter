FROM --platform=linux/amd64 mysql:8.0-debian
ENV MYSQL_ROOT_PASSWORD=Server1!

COPY sm_db/certs /certs
RUN chmod 644 /certs/*

RUN echo "[mysqld]" > /etc/mysql/conf.d/my.cnf \
    && echo "early-plugin-load=keyring_file.so" >> /etc/mysql/conf.d/my.cnf \
    && echo "keyring_file_data=/var/lib/mysql-keyring/keyring" >> /etc/mysql/conf.d/my.cnf \
    && echo "require_secure_transport = ON" >> /etc/mysql/conf.d/my.cnf \
    && echo "ssl-ca = /certs/ca-cert.pem" >> /etc/mysql/conf.d/my.cnf \
    && echo "ssl-cert = /certs/server-cert.pem" >> /etc/mysql/conf.d/my.cnf \
    && echo "ssl-key = /certs/server-key.pem" >> /etc/mysql/conf.d/my.cnf

RUN mkdir -p /var/lib/mysql-keyring && \
    chown mysql:mysql /var/lib/mysql-keyring && \
    chmod 700 /var/lib/mysql-keyring

COPY sm_db/sm_db.sql /docker-entrypoint-initdb.d/database_dump.sql
