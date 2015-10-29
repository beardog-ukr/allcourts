#!/bin/bash


#  This script sets some global variables.

case $USER in
  "houser" )
    basicDataPath="/home/houser/allcourts/gdata"
    archiveDataPath="/home/houser/allcourts/archive"
    recentDataPath="/home/houser/allcourts/recent"
    nvmPath="/home/houser/.nvm"
    ;;

  "u1user" )
    basicDataPath="/home/u1user/proj/allcourts/gatheringData"
    archiveDataPath="/home/u1user/proj/allcourts/gatheringData/archive"
    recentDataPath="/home/u1user/proj/allcourts/gatheringData/recent"
    nvmPath="$HOME/nodejs/nvm/"
    ;;

  * )
    echo "wrong user ($USER)"
    exit 1
esac


