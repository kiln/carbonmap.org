#!/bin/bash

# This script converts the raw spreadsheets into a form and location appropriate
# for load-data and load-shading

# After uploading new Excel spreadsheets, you should run:
#    bin/xls-to-csv.py data/Raw/*/*.xls*

WB_LATEST=/usr/local/cartograms/bin/wb-latest.py
WB_DATA="data/Raw/World Bank"
POPMULT="--multiply-by=$WB_DATA/sp.pop.totl_Indicator_en_csv_v2.csv"
ECN="/usr/local/cartograms/bin/encode-country-names.py"

# World Bank data
"$WB_LATEST"            "$WB_DATA"/ag.lnd.totl.k2_Indicator_en_csv_v2.csv    > data/Maps/Area.csv
"$WB_LATEST"            "$WB_DATA"/ny.gdp.mktp.pp.cd_Indicator_en_csv_v2.csv > data/Maps/GDP.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/en.clc.mdat.zs_Indicator_en_csv_v2.csv    > data/Maps/PeopleAtRisk.csv
"$WB_LATEST"            "$WB_DATA"/sp.pop.totl_Indicator_en_csv_v2.csv       > data/Maps/Population.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/si.pov.dday_Indicator_en_csv_v2.csv       > data/Maps/Poverty.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/en.pop.el5m.zs_Indicator_en_csv_v2.csv    > data/Maps/SeaLevel.csv

"$WB_LATEST"            "$WB_DATA"/ny.gdp.pcap.pp.cd_Indicator_en_csv_v2.csv > data/Shading/GDPperCapita.csv
"$WB_LATEST"            "$WB_DATA"/sp.pop.grow_Indicator_en_csv_v2.csv       > data/Shading/PopulationGrowth.csv

for dataset in Area GDP PeopleAtRisk PopulationGrowth Poverty SeaLevel
do
	"$ECN" data/Maps/"$dataset".csv > "data/Maps/With alpha-2/$dataset".csv
done

for dataset in GDPperCapita PopulationGrowth
do
	"$ECN" data/Shading/"$dataset".csv > "data/Shading/With alpha-2/$dataset".csv
done

# GCB from Glen Peters
bin/convert-gcb.py --conversion-factor=3.664 "data/Raw/GCB from Glen Peters/Global_Carbon_Budget_2014_v1.0/Territorial Emissions.csv" > data/Maps/Emissions.csv
bin/convert-gcb.py --conversion-factor=3.664 --year=2012 data/Raw/GCB\ from\ Glen\ Peters/Global_Carbon_Budget_2014_v1.0/Consumption\ Emissions.csv > data/Maps/Consumption.csv

# bin/csv-ratio.py data/Maps/Emissions.csv data/Maps/Population.csv > data/Shading/CO2perCapita.csv

