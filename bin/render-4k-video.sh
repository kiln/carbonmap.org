#!/bin/bash

set -e

MAPS=(_raw Area Population GDP Extraction Emissions Consumption Historical Reserves PeopleAtRisk SeaLevel Poverty)

i=0
n=${#MAPS[@]}
while [ $i -lt $[$n-1] ]
do
    from=${MAPS[$i]}
    to=${MAPS[$i+1]}
    
    j=0
    while [ $j -le 24 ]
    do
        filename="4k-video/$to-$(printf %02d $j)"
        if [ ! -e "$filename-full.png" ]
        then
            echo >&2 "Rendering $filename..."
            t=$(bc <<< "scale=2; $j/24")
            webkit2png -F "http://carbonmap.local/massive.xhtml#$from/$to/$t" -o "$filename"
        fi
        j=$[$j+1]
    done
    
    ffmpeg -y -i 4k-video/"$to"-%02d-full.png -vcodec prores -vf "pad=3840:2160:0:0:white" -bufsize 4000k 4k-video/"$to".mov
    i=$[$i+1]
done
