GOOS=linux go build
docker build -t wayneli1063/roundtable_gateway .
go clean
docker push wayneli1063/roundtable_gateway
