#!/bin/bash

set -e -x

FPS=30

MAPS=(_raw Area Population GDP Extraction Emissions Consumption Historical Reserves PeopleAtRisk _raw Emissions-PopulationGrowth PeopleAtRisk-PopulationGrowth)

i=0
n=${#MAPS[@]}
while [ $i -lt $[$n-1] ]
do
    from=${MAPS[$i]%-*}
    to=${MAPS[$i+1]%-*}
    shading=${MAPS[$i+1]#*-}
    
    url="http://carbonmap.local/massive.xhtml"
    ft="$from-$to"
    if [ "$shading" != "$to" ]
    then
        url="$url?shading=$shading"
        ft="$ft-$shading"
    fi
    
    j=0
    while [ $j -lt $FPS ]
    do
        filename="4k-video/$i-$(printf %02d $j)"
        if [ ! -e "$filename-full.png" ]
        then
            echo >&2 "Rendering $filename..."
            t=$(bc <<< "scale=4; $j/($FPS-1)")
            webkit2png -F "$url#$from/$to/$t" -o "$filename"
        fi
        j=$[$j+1]
    done
    
    ffmpeg -y -i 4k-video/"$i"-%02d-full.png -r $FPS -vcodec prores -vf "pad=3840:2160:0:0:white" -bufsize 4000k 4k-output/"$i-$ft".mov
    i=$[$i+1]
done
