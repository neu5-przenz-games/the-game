#!/usr/bin/env bash

if [ "$NODE_ENV" == "production" ]; 
    then yarn test:unit; 
    else yarn test:all;
fi