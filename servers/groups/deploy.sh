./build.sh

docker push wayneli1063/group_handlers

ssh ec2-user@api.roundtablefinder.com << EOF

docker rm -f group_handlers
docker rm -f group_mongo

docker pull wayneli1063/group_handlers

docker run -d -p 27017:27017 --name group_mongo --network rt_network mongo

EOF

# export MONGOADDR=group_mongo:27017

# docker run -d --name group_handlers --network rt_network -e MONGOADDR=$MONGOADDR wayneli1063/group_handlers