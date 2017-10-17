#!/bin/sh
# Build Docker image
./build-docker.sh

# Run it
docker rm --force ngunits-001
docker run --name ngunits-001 -d -p 9081:9081 -p 9082:9082 -p 9083:9083 -p 9084:9084 -p 9085:9085 -p 3000:80 ngunits
exit_status=$?
if [ ! $exit_status -eq 0 ]; then
    echo "Failed to run the docker container"
    exit $exit_status
fi

# Wait for docker image and all APIs inside are up and running
sleep 2s
echo "Waiting for APIs to be started..."
#
# wait while APIs start
curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9083/sciper-api/hc"
response=`$curl_command`
counter=0
while [ "$response" != "200" ]
do
	counter=$((counter+1))
	if [[ "$counter" -gt 60 ]]; then
		echo "API check timeout"
		exit 1
	fi
	sleep 2s
	response=`$curl_command`
done
echo "sciper-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9082/cadi-api/hc"
response=`$curl_command`
counter=0
while [ "$response" != "200" ]
do
	counter=$((counter+1))
	if [[ "$counter" -gt 60 ]]; then
		echo "API check timeout"
		exit 1
	fi
	sleep 2s
	response=`$curl_command`
done
echo "cadi-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9084/archibus-api/hc"
response=`$curl_command`
counter=0
while [ "$response" != "200" ]
do
	counter=$((counter+1))
	if [[ "$counter" -gt 60 ]]; then
		echo "API check timeout"
		exit 1
	fi
	sleep 2s
	response=`$curl_command`
done
echo "archibus-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9081/units-api/hc"
response=`$curl_command`
counter=0
while [ "$response" != "200" ]
do
	counter=$((counter+1))
	if [[ "$counter" -gt 60 ]]; then
		echo "API check timeout"
		exit 1
	fi
	sleep 2s
	response=`$curl_command`
done
echo "units-api is started!"

curl_command="curl --write-out %{http_code} --silent --output /dev/null localhost:9085/userinfo"
response=`$curl_command`
counter=0
while [ "$response" != "200" ]
do
	counter=$((counter+1))
	if [[ "$counter" -gt 60 ]]; then
		echo "API check timeout"
		exit 1
	fi
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
exit_status=$?
if [ ! $exit_status -eq 0 ]; then
    echo "Failed to update web driver"
    exit $exit_status
fi
npm run webdriver:start &

sleep 10s

# Start E2E tests
echo "Starting E2E tests..."
npm run e2e:docker
exit_status=$?
if [ ! $exit_status -eq 0 ]; then
    echo "E2E tests have failed"
fi

# Shutdown docker image
docker rm --force ngunits-001

exit $exit_status
