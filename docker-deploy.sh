#!/bin/bash

docker build -t shreyasssk/clinic-server:latest -t shreyasssk/clinic-server:$SHA .

docker push shreyasssk/clinic-server:latest
docker push shreyasssk/clinc-server:$SHA

echo "DONE! ;)"