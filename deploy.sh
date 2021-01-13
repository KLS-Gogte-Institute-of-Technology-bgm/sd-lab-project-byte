#!/bin/bash

echo "***Checking for latest version of image***"
docker pull shreyasssk/clinic-server

echo "***deploying...***"
docker-compose up

echo "***Implementing Demo***"