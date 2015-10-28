#!/bin/bash


#  This script sets some global variables.

case $USER in
  "houser" )
    basicDataPath="/home/houser/kc/"
    nvmPath="/home/houser/.nvm/"
    ;;

  "u1user" )
    basicDataPath="/home/u1user/proj/allcourts/gatheringData"
    archiveDataPath="/home/u1user/proj/allcourts/devtesttmp/archive"
    recentDataPath="/home/u1user/proj/allcourts/devtesttmp/recent"
    nvmPath="$HOME/nodejs/nvm/"
    ;;

  * )
    echo "wrong user ($USER)"
    exit 1
esac


