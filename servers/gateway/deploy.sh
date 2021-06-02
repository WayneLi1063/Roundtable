./build.sh
../db/build.sh

docker push wayneli1063/roundtable_gateway
docker push wayneli1063/roundtable_mysqldb

ssh ec2-user@api.roundtablefinder.com << EOF

docker rm -f rt_gateway
docker rm -f rt_mysqldb
docker rm -f rt_redis

docker pull wayneli1063/roundtable_gateway
docker pull wayneli1063/roundtable_mysqldb

docker run -d -p 6379:6379 --name rt_redis --network rt_network redis

EOF

# docker run -d \
# -p 3306:3306 \
# --name rt_mysqldb \
# -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
# -e MYSQL_DATABASE=live \
# --network rt_network \
# wayneli1063/roundtable_mysqldb

# docker run -d \
# -p 443:443 \
# --name rt_gateway \
# -v /etc/letsencrypt:/etc/letsencrypt:ro \
# -e TLSCERT=/etc/letsencrypt/live/api.roundtablefinder.com/fullchain.pem \
# -e TLSKEY=/etc/letsencrypt/live/api.roundtablefinder.com/privkey.pem \
# -e SESSIONKEY=$SESSIONKEY \
# -e GROUPSADDRS=$GROUPSADDRS \
# -e REDISADDR=$REDISADDR \
# -e DSN=root:$MYSQL_ROOT_PASSWORD@tcp\($MYSQLADDR\)/live \
# --network rt_network \
# --restart unless-stopped \
# wayneli1063/roundtable_gateway