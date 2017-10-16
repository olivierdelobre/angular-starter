#!/bin/sh
service nginx start

cd /tmp/apis/units-api
nohup java -Xmx128M -Dspring.config.location=file:./application.properties -jar ./app.jar > ./api.log &

cd /tmp/apis/sciper-api
nohup java -Xmx128M -Dspring.config.location=file:./application.properties -jar ./app.jar > ./api.log &

cd /tmp/apis/cadi-api
nohup java -Xmx128M -Dspring.config.location=file:./application.properties -jar ./app.jar > ./api.log &

cd /tmp/apis/archibus-api
nohup java -Xmx128M -Dspring.config.location=file:./application.properties -jar ./app.jar > ./api.log &

cd /tmp
json-server --watch ./mock-json-server-db.json --port 9085
