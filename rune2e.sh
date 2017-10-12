#!/bin/sh

NEXUS_REPOSITORY=http://idevelopsrv3.epfl.ch:8081/repository/maven-snapshots/
LOCAL_REPOSITORY=`mvn help:evaluate -Dexpression=settings.localRepository | grep -v '\[INFO\]'`
UNITS_API_VERSION=1.0.4-SNAPSHOT
CADI_API_VERSION=1.0.0-SNAPSHOT
SCIPER_API_VERSION=1.0.2-SNAPSHOT
ARCHIBUS_API_VERSION=1.0.0-SNAPSHOT

function build_docker_image() {
	mvn org.apache.maven.plugins:maven-dependency-plugin:2.4:get -DartifactId=$1 -DgroupId=ch.epfl.api -Dversion=$2 -DremoteRepositories=nexus-epfl::::$NEXUS_REPOSITORY -Dtransitive=false -Dskip=true
	JAR_PATH=`echo "$LOCAL_REPOSITORY/ch/epfl/api/$1/$2/*$2.jar" | tr '\\' '/' | sed -e "s/C:/\/C/g"`
	cp $JAR_PATH ./e2e/$1/
	docker build -t $1 ./e2e/$1/
	rm ./e2e/$1/app.jar
}

function run_api() {
	mvn --quiet org.apache.maven.plugins:maven-dependency-plugin:2.4:get -DartifactId=$1 -DgroupId=ch.epfl.api -Dversion=$2 -DremoteRepositories=nexus-epfl::::$NEXUS_REPOSITORY -Dtransitive=false -Dskip=true
	JAR_PATH=`echo "$LOCAL_REPOSITORY/ch/epfl/api/$1/$2/*$2.jar" | tr '\\' '/' | sed -e "s/C:/\/C/g"`
	cd ./e2e/$1
	rm -rf *.jar
	cp $JAR_PATH ./app.jar
	nohup java -Xmx128M -Dspring.config.location=file:./application.properties -jar ./app.jar > ./api.log &
	cd ../..
}

# run Units API
#build_docker_image units-api 1.0.4-SNAPSHOT
#docker rm units-api-001
#docker run --name units-api-001 -d -p 9081:8080 units-api
run_api units-api 1.0.4-SNAPSHOT
UNITS_API_PID=$!
#
# run CADI API
run_api cadi-api 1.0.0-SNAPSHOT
CADI_API_PID=$!

# run Sciper API
run_api sciper-api 1.0.2-SNAPSHOT
SCIPER_API_PID=$!

# run Archibus API
run_api archibus-api 1.0.0-SNAPSHOT
ARCHIBUS_API_PID=$!

# run Mock Tequila
json-server --watch mock-json-server-db.json --port 9085 > /c/Temp/tequila-mock.log &
TEQUILA_API_PID=$!

sleep 2s
echo "Waiting for APIs to be started..."
#
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

# Wake up APIs...
curl http://localhost:9081/units-api/v1/units/13030
curl http://localhost:9082/cadi-api/v1/countries?query=CH
curl http://localhost:9083/sciper-api/v1/people?query=delo
curl http://localhost:9084/archibus-api/v1/rooms?query=INN

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
E2E_PID=$!

# kill all java and node spawned processes
kill -9 $SCIPER_API_PID
kill -9 $CADI_API_PID
kill -9 $ARCHIBUS_API_PID
kill -9 $UNITS_API_PID
kill -9 TEQUILA_API_PID
kill -9 $FRONTEND_PID
kill -9 $E2E_PID
