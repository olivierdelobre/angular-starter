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

# Build Docker image
./build-docker.sh

# Run it
docker rm --force ngunits-001
docker run --name ngunits-001 -d -p 9081:9081 -p 9082:9082 -p 9083:9083 -p 9084:9084 -p 9085:9085 -p 3000:80 ngunits

# Wait for docker image and all APIs inside are up and running
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

# Run webdriver/selenium
npm run webdriver:update

# Start E2E tests
echo "Starting E2E tests..."
npm run e2e
