#!/bin/bash

# Convert the raw spreadsheets into a form and location appropriate
# for load-data and load-shading

WB_LATEST=/usr/local/cartograms/bin/wb-latest.py
WB_DATA="data/Raw/World Bank"
POPMULT="--multiply-by=$WB_DATA/sp.pop.totl_Indicator_en_csv_v2.csv"


# World Bank data
"$WB_LATEST"            "$WB_DATA"/ag.lnd.totl.k2_Indicator_en_csv_v2.csv    > data/Maps/Area.csv
"$WB_LATEST"            "$WB_DATA"/ny.gdp.mktp.pp.cd_Indicator_en_csv_v2.csv > data/Maps/GDP.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/en.clc.mdat.zs_Indicator_en_csv_v2.csv    > data/Maps/PeopleAtRisk.csv
"$WB_LATEST"            "$WB_DATA"/sp.pop.totl_Indicator_en_csv_v2.csv       > data/Maps/Population.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/si.pov.dday_Indicator_en_csv_v2.csv       > data/Maps/Poverty.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/en.pop.el5m.zs_Indicator_en_csv_v2.csv    > data/Maps/SeaLevel.csv

"$WB_LATEST"            "$WB_DATA"/ny.gdp.pcap.pp.cd_Indicator_en_csv_v2.csv > data/Shading/GDPperCapita.csv
"$WB_LATEST"            "$WB_DATA"/sp.pop.grow_Indicator_en_csv_v2.csv       > data/Shading/PopulationGrowth.csv


