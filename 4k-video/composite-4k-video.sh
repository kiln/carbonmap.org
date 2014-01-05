#!/bin/bash

set -e -x

for map in _raw Area Population GDP Extraction Emissions Consumption Historical Reserves PeopleAtRisk SeaLevel Poverty
do
    if [ ! -e "4k-output/$map-full.png" ]
    then
        webkit2png -F "http://carbonmap.local/massive.xhtml#$map/$map/1" -o "4k-output/$map"
    fi
done

shading=PopulationGrowth
for map in _raw Emissions PeopleAtRisk
do
    if [ ! -e "4k-output/$map-$shading-full.png" ]
    then
        webkit2png -F "http://carbonmap.local/massive.xhtml?shading=$shading#$map/$map/1" -o "4k-output/$map-$shading"
    fi
done

perl -ne 'print "$1 $2\n" if m{^\s*file '\''4k-output/([^.]+)\.freeze-([\d.]+)\.mov'\''}' 4k-video/4k-composite.txt \
| while read line
do
    map=${line% *}
    duration=${line#* }
    if [ ! -e 4k-output/$map.freeze-$duration.mov ]
    then
        ffmpeg -f image2 -r 1/$duration -i 4k-output/$map-full.png -vcodec prores -vf "pad=3840:2160:0:0:white" -bufsize 4000k 4k-output/$map.freeze-$duration.mov </dev/null
    fi
done

ffmpeg -f concat -i 4k-video/4k-composite.txt -c copy 4k-output/composite.mov
ffmpeg -i 4k-output/composite.mov -i site/intro.mp3 -map 0 -map 1 -c copy 4k-output/composite-with-audio.mov
