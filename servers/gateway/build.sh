GOOS=linux go build
docker build -t penumbrapow/roundtable_gateway .
go clean
docker push penumbrapow/roundtable_gateway
