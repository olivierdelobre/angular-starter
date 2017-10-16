FROM openjdk:8-jre

# install console and node
RUN curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh &&\
    bash nodesource_setup.sh &&\
    apt-get install -y nodejs &&\
    npm install -g json-server

# install APIs
ADD ./e2e/units-api/* /tmp/apis/units-api/
ADD ./e2e/sciper-api/* /tmp/apis/sciper-api/
ADD ./e2e/cadi-api/* /tmp/apis/cadi-api/
ADD ./e2e/archibus-api/* /tmp/apis/archibus-api/
ADD ./mock-json-server-db.json /tmp
ADD ./e2e/startup.sh /tmp

# install npm ( in separate dir due to docker cache)
ADD package.json /tmp/npm_inst/package.json
RUN cd /tmp/npm_inst &&\
    npm install &&\
    mkdir -p /tmp/app &&\
    mv /tmp/npm_inst/node_modules /tmp/app/

# copy and replace config
ADD . /tmp/app
RUN cd /tmp/app &&\
    cp ./config/webpack.e2e.js ./config/webpack.dev.js

# install nginx
RUN apt-get install -y nginx

# build and publish application
RUN cd /tmp/app &&\
    npm run build:dev &&\
    mv ./dist/* /var/www/html/

# this is for virtual host purposes
EXPOSE 9081
EXPOSE 9082
EXPOSE 9083
EXPOSE 9084
EXPOSE 9085
EXPOSE 80

CMD /tmp/startup.sh
