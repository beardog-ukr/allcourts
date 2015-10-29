#!/bin/bash


#  This script is supposed to be the one specified  in /etc/crontab.
# Performs some initial tests and starts data gathering and processing

#set -o verbose

#-- Command Line Options -----------------------------------------------
taskName=$1;
# Script accepts a task name, one of
#  - "clean" removes all generated/downloaded files in 'recent', 'archive' etc.

#-- Init ---------------------------------------------------------------

#no init

#-- Date and timestamp -------------------------------------------------
dateStamp=`date +%Y%m%d_%H%M%S`
dateStampStr=`date "+%d.%m.%Y %H:%M"`
#echo "started working at " $dateStampStr

#-- Get base path -------------------------------------------------------------
# all other actions will be done in the folder where script file is stored
# see http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink,
#  we need to resolve it relative to the path where the symlink file was located
done
scriptFolder="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

#-- Check for nodejs or load it -----------------------------------------------
nvmPath="$HOME/nodejs/nvm/"
. $nvmPath"/"nvm.sh
nvm use 0.12

#node --version
#echo $PATH
node --version
if [ $? -eq 0 ]
then
  echo "node was found"
else
  echo "There is no nodejs here"
  exit 1
fi

#------------------------------------------------------------------------------

makeClean() {
  echo "started working (make clean) at " $dateStampStr

  find $scriptFolder"/gatheringData/recent/" -name "*.json" | xargs rm -vf
  find $scriptFolder"/gatheringData/archive/" -name "*.tgz" | xargs rm -vf

#  find $scriptFolder"/gatheringData/recent/" -name "*.json" | xargs rm -vf

}

#------------------------------------------------------------------------------

makeVisualGroups() {
  echo "started working (make groups) at " $dateStampStr

  vgf=$scriptFolder"/courtParameters/"
  node $vgf"/param2json.js" -c $vgf"/ac.yaml" -w $vgf -g $vgf

}

#------------------------------------------------------------------------------
printHelp() {
  echo "Usage: vs.sh <task name>"
  echo "Task name should be one of following:"
  echo "\"clean\" : removes all generated or downloaded files in 'recent', 'archive' etc."
  echo ""

}

#------------------------------------------------------------------------------
#------------------------------------------------------------------------------
#------------------------------------------------------------------------------

case "$taskName" in
"clean")  makeClean
    ;;
"groups")  makeVisualGroups
    ;;
*) printHelp
   ;;
esac


