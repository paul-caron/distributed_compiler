read -p "What is the host?(eg: localhost ):  " host
echo $host
read -p "What is the port?(eg: 8080 ):  " port
echo $port

#set the image builder script as executable, writable, and readable
chmod 777 ./client/build_docker_image.sh

#set host in .env files in each modules
echo 'HOST=' $host > ./client/.env
echo 'HOST=' $host > ./server/.env
echo 'HOST=' $host > ./emitter/.env

#set port in .env files in each modules
echo 'PORT=' $port >> ./client/.env
echo 'PORT=' $port >> ./server/.env
echo 'PORT=' $port >> ./emitter/.env

