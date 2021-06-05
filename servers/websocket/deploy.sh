./build.sh

docker push penumbrapow/rtwebsocket

ssh ec2-user@api.roundtablefinder.com << EOF

docker rm -f rtwebsocket

docker pull penumbrapow/rtwebsocket

docker run -d -p 8443:8443 --name rtwebsocket penumbrapow/rtwebsocket

EOF