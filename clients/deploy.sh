./build.sh

docker push wayneli1063/roundtable_client

ssh ec2-user@roundtablefinder.com << EOF

docker rm -f roundtable_client

docker pull wayneli1063/roundtable_client

docker run -d \
-p 443:443 \
-p 80:80 \
--name roundtable_client \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-e TLSCERT=/etc/letsencrypt/live/roundtablefinder.com/fullchain.pem \
-e TLSKEY=/etc/letsencrypt/live/roundtablefinder.com/privkey.pem \
wayneli1063/roundtable_client

EOF