#!/bin/sh
NEXUS_REPOSITORY=http://idevelopsrv3.epfl.ch:8081/repository/maven-snapshots/
LOCAL_REPOSITORY=`mvn help:evaluate -Dexpression=settings.localRepository | grep -v 'INFO'`

function get_jarfile() {
	mvn --quiet org.apache.maven.plugins:maven-dependency-plugin:2.4:get -DartifactId=$1 -DgroupId=ch.epfl.api -Dversion=$2 -DremoteRepositories=nexus-epfl::::$NEXUS_REPOSITORY -Dtransitive=false -Dskip=true
	JAR_PATH=`echo "$LOCAL_REPOSITORY/ch/epfl/api/$1/$2/*$2.jar" | tr '\\' '/' | sed -e "s/C:/\/C/g"`
	rm -rf ./e2e/$1/*.jar
	cp -r $JAR_PATH ./e2e/$1/app.jar
}

get_jarfile units-api 1.0.7-SNAPSHOT
get_jarfile cadi-api 1.0.0-SNAPSHOT
get_jarfile sciper-api 1.0.2-SNAPSHOT
get_jarfile archibus-api 1.0.0-SNAPSHOT

docker build -t ngunits .
