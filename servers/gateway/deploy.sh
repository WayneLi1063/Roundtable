./build.sh
../db/build.sh

docker push wayneli1063/gateway
docker push wayneli1063/mysqldb

ssh ec2-user@api.wayneli.me << EOF

docker rm -f 441gateway
docker rm -f 441mysqldb
docker rm -f 441redis

docker pull wayneli1063/gateway
docker pull wayneli1063/mysqldb

docker run -d -p 6379:6379 --name 441redis --network 441network redis

docker run -d \
-p 3306:3306 \
--name 441mysqldb \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-e MYSQL_DATABASE=live \
--network 441network \
wayneli1063/mysqldb

docker run -d \
-p 443:443 \
--name 441gateway \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-e TLSCERT=/etc/letsencrypt/live/api.wayneli.me/fullchain.pem \
-e TLSKEY=/etc/letsencrypt/live/api.wayneli.me/privkey.pem \
-e SESSIONKEY=$SESSIONKEY \
-e REDISADDR=$REDISADDR \
-e DSN=root:$MYSQL_ROOT_PASSWORD@tcp\($MYSQLADDR\)/live \
--network 441network \
--restart unless-stopped \
wayneli1063/gateway

EOF