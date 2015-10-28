#!/bin/bash


#  This script is supposed to be the one specified  in /etc/crontab.
# Performs some initial tests and starts data gathering and processing

#set -o verbose

#-- Command Line Options -----------------------------------------------

# no options

#-- Init ---------------------------------------------------------------

#no init

#-- Date and timestamp -------------------------------------------------
dateStamp=`date +%Y%m%d_%H%M%S`
dateStampStr=`date "+%d.%m.%Y %H:%M"`
echo "started working at " $dateStampStr

#-- Loading settings ---------------------------------------------------------
# settings will be loaded from the folder where script file is stored
# see http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink,
#  we need to resolve it relative to the path where the symlink file was located
done
scriptFolder="$( cd -P "$( dirname "$SOURCE" )" && pwd )"


. $scriptFolder/gatheringSettings.sh
if [ $? -eq 0 ]
then
  echo "Global settings loaded"
else
  echo "Failed to load global settings"
  exit 1
fi

#-- Log received settings -----------------------------------------------------
echo "Loaded following values:"
echo "  basicDataPath = \"${basicDataPath}\""
echo "  archiveDataPath = \"${archiveDataPath}\""
echo "  recentDataPath = \"${recentDataPath}\""
echo "  nvmPath = \"${nvmPath}\""
if [ -n "$basicDataPath" -a -n "$archiveDataPath" -a -n "$recentDataPath" -a -n "$nvmPath" ]
then
  echo "continue work"
else
  echo "One of initial parameters is incorrect (empty)"
  exit 1
fi

#-- Check for nodejs or load it -----------------------------------------------
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

#-- Check for wget ------------------------------------------------------------
wget --version &> /dev/null
if [ $? -eq 0 ]
then
  echo "wget was found"
else
  echo "There is no wget in the system"
  exit 1
fi

#-- Courts database (file) ----------------------------------------------------
courtsFileName=$scriptFolder"/courts.json"
if [ ! -r $courtsFileName ]
then
#  echo "Courts settings file not found ($courtsFileName)"
  exit 1
fi


#------------------------------------------------------------------------------
# Finally ---------------------------------------------------------------------

# most of work
node $scriptFolder/taskStart.js --courts $courtsFileName --archive $archiveDataPath --recent $recentDataPath

# archive all newly received files
for fn in `find $archiveDataPath -name "*.json"`
do
 #echo "file is $fn"
 tar -czf $fn".tgz" $fn
 rm $fn
done

# update timestamp for website
echo $dateStampStr > $recentDataPath"/date.txt"
