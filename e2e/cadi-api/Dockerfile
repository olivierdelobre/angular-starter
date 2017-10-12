FROM openjdk:8-jre
VOLUME /tmp
ADD *.jar app.jar
ADD application.properties application.properties
ADD init.sql init.sql
RUN sh -c 'touch /app.jar'
ENV JAVA_OPTS="-Xms64M -Xmx128M"
EXPOSE 8080
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Dspring.config.location=file:./application.properties -Djava.security.egd=file:/dev/./urandom -jar /app.jar" ]