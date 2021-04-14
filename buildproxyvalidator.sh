#!/bin/bash
# Build script
set -eo pipefail

build_tag=$1
name=proxyvalidator
node=$2
org=$3

docker build -f ./Dockerfile --label commitHash=$(git rev-parse --short HEAD) -t ${org}/${name}:${build_tag} .
echo {\"proxyvalidator_image_name\" : \"${name}\", \"proxyvalidator_image_tag\" : \"${build_tag}\", \"node_name\" : \"$node\"} > proxyvalidatormetadata.json
