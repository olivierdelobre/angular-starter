#!/bin/sh

# run Units API
nohup java -Xmx128M -Dspring.config.location=classpath:/mock/application.properties -Dserver.port=9081 -jar /c/Users/Olivier/eclipse/Luna/Integration/units-api/target/units-api-1.0.4-SNAPSHOT.jar > /c/Temp/units-api.log &
UNITS_API_PID=$!

# run CADI API
nohup java -Xmx128M -Dspring.config.location=classpath:/mock/application.properties -Dserver.port=9082 -jar /c/Users/Olivier/eclipse/Luna/Integration/cadi-api/target/cadi-api-1.0.0-SNAPSHOT.jar > /c/Temp/cadi-api.log &
CADI_API_PID=$!

# run Sciper API
nohup java -Xmx128M -Dspring.config.location=classpath:/mock/application.properties -Dserver.port=9083 -jar /c/Users/Olivier/eclipse/Luna/Integration/sciper-api/target/sciper-api-1.0.2-SNAPSHOT.jar > /c/Temp/sciper-api.log &
SCIPER_API_PID=$!

# run Archibus API
nohup java -Xmx128M -Dspring.config.location=classpath:/mock/application.properties -Dserver.port=9084 -jar /c/Users/Olivier/eclipse/Luna/Integration/archibus-api/target/archibus-api-1.0.0-SNAPSHOT.jar > /c/Temp/archibus-api.log &
ARCHIBUS_API_PID=$!

# run Mock Tequila
json-server --watch mock-json-server-db.json --port 9085 > /c/Temp/tequila-mock.log &
TEQUILA_API_PID=$!

sleep 2s
echo "Waiting for APIs to be started..."

# wait while APIs start
curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9083/sciper-api/hc"
response=`$curl_command`
while [ "$response" != "200" ]
do
	sleep 2s
	response=`$curl_command`
done
echo "sciper-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9082/cadi-api/hc"
response=`$curl_command`
while [ "$response" != "200" ]
do
	sleep 2s
	response=`$curl_command`
done
echo "cadi-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9084/archibus-api/hc"
response=`$curl_command`
while [ "$response" != "200" ]
do
	sleep 2s
	response=`$curl_command`
done
echo "archibus-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9081/units-api/hc"
response=`$curl_command`
while [ "$response" != "200" ]
do
	sleep 2s
	response=`$curl_command`
done
echo "units-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9085/userinfo"
response=`$curl_command`
while [ "$response" != "200" ]
do
	sleep 2s
	response=`$curl_command`
done
echo "tequlia mock is started!"

echo "All APIs are started!"

cp ./config/webpack.dev.js ./config/webpack.dev.js.backup
cp ./config/webpack.e2e.js ./config/webpack.dev.js
echo "Starting the Frontend test server..."
npm run server:dev > /c/Temp/frontend-units-dev.log &
FRONTEND_PID=$!

# Wait for frontend start to be finished
sleep 2s
response=`grep 'Compiled successfully' /c/Temp/frontend-units-dev.log`
while [ "$response" == "" ]
do
	sleep 1s
	response=`grep 'Compiled successfully' /c/Temp/frontend-units-dev.log`
done
echo "Frontend is started!"

cp ./config/webpack.dev.js.backup ./config/webpack.dev.js

echo "Starting E2E tests..."
npm run e2e

# kill all java and node spawned processes
kill -9 $SCIPER_API_PID
kill -9 $CADI_API_PID
kill -9 $ARCHIBUS_API_PID
kill -9 $UNITS_API_PID
kill -9 $FRONTEND_PID
