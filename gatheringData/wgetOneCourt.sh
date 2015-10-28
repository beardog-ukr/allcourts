#!/bin/bash

# The script downloads information from one court (of the xx.xx.court.gov.ua)

#-- Command Line Options ---------------------------------------------------

# ./wgetOneCourt <court Id> <court code>
# <court Id> is two last court subdomains, like "dr.ki" for "http://dr.ki.court.gov.ua"
# <court code> is court code, a parameter of post request, like "2602"

courtId="$1"
courtCode="$2"
resultFileName="$3"

echo "here for $courtId as $courtCode"

### debug lines
cp ./baseprettyfied.json $resultFileName
exit 0
### debug lines end

incomingFileName="$PWD/new.php"

url="http://${courtId}.court.gov.ua/new.php"

echo "requesting $url ..."

wget \
       --header='Accept: application/json, text/javascript, */*; q=0.01' \
       --header='Accept-Encoding: gzip, deflate' \
       --header='Accept-Language: en-US,en;q=0.5' \
       --header='Cache-Control: no-cache' \
       --header='Connection: keep-alive' \
       --header='Content-Length: 15' \
       --header='Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
       --no-cookies \
       --header="Host: ${courtId}.court.gov.ua" \
       --header='Pragma: no-cache' \
       --header="Referer: http://${courtId}.court.gov.ua/sud${courtCode}/csz/" \
       --header='User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:28.0) Gecko/20100101 Firefox/28.0' \
       --header='X-Requested-With: XMLHttpRequest' \
       \
       --post-data="q_court_id=${courtCode}" \
       --output-document="$incomingFileName" \
       \
       "$url"

if [ $? -eq 0 ]
then
  echo "downloading completed"
else
  echo "failed to download"
  echo "Download Error ($dateStampStr)" > $recentDataPath"/date.txt"
  exit 0
fi

  # debug lines ;  don't use it
  #cp "./debugnew2.php" $incomingFileName
  # debug lines end

# A simple prettyfy; useful for debug purposes
#prettyfiedFileName="$PWD/prettyfied.json"
#rm -f $prettyfiedFileName
rm -f $resultFileName
cat "$incomingFileName" | sed 's/\",\"/\"\n ,\"/g' | sed 's/\},{/\n \},\n \{/g' &> "$resultFileName"

rm -f $incomingFileName

echo "done"

