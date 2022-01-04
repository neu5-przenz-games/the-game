#!/usr/bin/env bash

if [ "$NODE_ENV" == "production" ]; 
    then yarn build:prod; 
    else yarn build:dev; 
fi