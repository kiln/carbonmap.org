#!/bin/bash

set -ex

# This script converts the raw spreadsheets into a form and location appropriate
# for load-data and load-shading

# After uploading new Excel spreadsheets, you should run:
#    bin/xls-to-csv.py data/Raw/*/*.xls*

WB_LATEST=/usr/local/cartograms/bin/wb-latest.py
WB_DATA="data/Raw/World Bank"
POPMULT="--multiply-by=$WB_DATA/sp.pop.totl_Indicator_en_csv_v2.csv"
ECN="/usr/local/cartograms/bin/encode-country-names.py"

## World Bank data
"$WB_LATEST"            "$WB_DATA"/ag.lnd.totl.k2_Indicator_en_csv_v2.csv    > data/Maps/Area.csv
"$WB_LATEST"            "$WB_DATA"/ny.gdp.mktp.pp.cd_Indicator_en_csv_v2.csv > data/Maps/GDP.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/en.clc.mdat.zs_Indicator_en_csv_v2.csv    > data/Maps/PeopleAtRisk.csv
"$WB_LATEST"            "$WB_DATA"/sp.pop.totl_Indicator_en_csv_v2.csv       > data/Maps/Population.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/si.pov.dday_Indicator_en_csv_v2.csv       > data/Maps/Poverty.csv
"$WB_LATEST" "$POPMULT" "$WB_DATA"/en.pop.el5m.zs_Indicator_en_csv_v2.csv    > data/Maps/SeaLevel.csv

"$WB_LATEST"            "$WB_DATA"/ny.gdp.pcap.pp.cd_Indicator_en_csv_v2.csv > data/Shading/GDPperCapita.csv
"$WB_LATEST"            "$WB_DATA"/sp.pop.grow_Indicator_en_csv_v2.csv       > data/Shading/PopulationGrowth.csv


## GCB from Glen Peters
bin/convert-gcb.py --conversion-factor=3.664 "data/Raw/GCB from Glen Peters/Global_Carbon_Budget_2014_v1.0/Territorial Emissions.csv" > data/Maps/Emissions.csv
bin/convert-gcb.py --conversion-factor=3.664 --year=2012 data/Raw/GCB\ from\ Glen\ Peters/Global_Carbon_Budget_2014_v1.0/Consumption\ Emissions.csv > data/Maps/Consumption.csv

# Add alpha-2 codes to the files we’ve made so far
for dataset in Area Consumption Emissions GDP PeopleAtRisk Population Poverty SeaLevel
do
	"$ECN" data/Maps/"$dataset".csv > "data/Maps/With alpha-2/$dataset".csv
done

for dataset in GDPperCapita PopulationGrowth
do
	"$ECN" data/Shading/"$dataset".csv > "data/Shading/With alpha-2/$dataset".csv
done

# Input files are in millions of tonnes of CO2 and number of people; output is in tonnes of CO2 per capita
bin/csv-ratio.py --scale=1e6 data/Maps/"With alpha-2"/Emissions.csv data/Maps/"With alpha-2"/Population.csv > data/Shading/CO2perCapita.csv
# Already has alpha-2 codes, so no need to reencode
cp data/Shading/CO2perCapita.csv data/Shading/"With alpha-2"/CO2perCapita.csv

bin/emissions-change.py data/Raw/GCB\ from\ Glen\ Peters/Global_Carbon_Budget_2014_v1.0/Territorial\ Emissions.csv > data/Shading/EmissionsChange.csv
"$ECN" data/Shading/EmissionsChange.csv > data/Shading/"With alpha-2"/EmissionsChange.csv


## BP data
# Extraction
bin/convert-bp.py --conversion-factor=$(bc -l <<<"0.1364 * 3.07") data/Raw/BP/BP-Statistical_Review_of_world_energy_2014_workbook/Oil\ Production\ –\ Tonnes.csv > data/Working/Extraction-oil.csv
bin/convert-bp.py --conversion-factor=$(bc -l <<<"0.90 * 2.35") data/Raw/BP/BP-Statistical_Review_of_world_energy_2014_workbook/Gas\ Production\ –\ tonnes.csv > data/Working/Extraction-gas.csv
bin/convert-bp.py --conversion-factor=$(bc -l <<<"0.513 * 3.96") data/Raw/BP/BP-Statistical_Review_of_world_energy_2014_workbook/Coal\ Production\ -\ Tonnes.csv > data/Working/Extraction-coal.csv

bin/csv-sum.py --key="Country Name" data/Working/Extraction-oil.csv data/Working/Extraction-gas.csv data/Working/Extraction-coal.csv > data/Maps/Extraction.csv
"$ECN" data/Maps/Extraction.csv > data/Maps/"With alpha-2"/Extraction.csv

# Reserves
/usr/local/cartograms/bin/csv-snip --expect-header="Oil: Proved reserves,at end 2013" --output-header="Country Name,Value" --cols=A,F --data-rows=6..70 'data/Raw/BP/BP-Statistical_Review_of_world_energy_2014_workbook/Oil – Proved reserves.csv'  > data/Working/Reserves-oil.csv
/usr/local/cartograms/bin/csv-snip --header-row=2 --expect-header=",at end 2013" --output-header="Country Name,Value" --cols=A,F --data-rows=7..72 data/Raw/BP/BP-Statistical_Review_of_world_energy_2014_workbook/Gas\ –\ Proved\ reserves.csv > data/Working/Reserves-gas.csv
/usr/local/cartograms/bin/csv-snip --header-row=3 --expect-header="Million tonnes,Total" --output-header="Country Name,Value" --cols=A,D --data-rows=5..50 data/Raw/BP/BP-Statistical_Review_of_world_energy_2014_workbook/Coal\ -\ Reserves.csv > data/Working/Reserves-coal.csv
for fuel in oil gas coal
do
	"$ECN" data/Working/Reserves"-$fuel".csv > data/Working/"With alpha-2"/Reserves"-$fuel".csv
done

# Convert all values into millions of tonnes of CO₂
bin/csv-sum.py --key="Alpha-2" --multipliers=$(bc -l <<<"0.1364 * 3.07 * 0.001"),$(bc -l <<<"0.90 * 2.35"),$(bc -l <<<"0.513 * 3.96") data/Working/"With alpha-2"/Reserves-{oil,gas,coal}.csv > data/Maps/Reserves.csv
cp data/Maps/Reserves.csv data/Maps/"With alpha-2"/Reserves.csv


# Historical
perl -ln -e 's/Emissions 1850 to 2011/Value/; @F=split(/\t/,$_); print "\"$F[0]\",$F[1]"' data/Raw/CAIT/Historical.tsv > data/Maps/Historical.csv
"$ECN" data/Maps/Historical.csv > data/Maps/"With alpha-2"/Historical.csv
