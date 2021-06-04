./build.sh

docker push penumbrapow/rtwebsocket

ssh ec2-user@api.roundtablefinder.com << EOF

docker rm -f rtwebsocket

docker pull penumbrapow/rtwebsocket

docker run -d -p 8000:8000 --name rtwebsocket penumbrapow/rtwebsocket

EOF