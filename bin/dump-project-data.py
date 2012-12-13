#!/usr/bin/python

import csv
import sys

import psycopg2

project_name = sys.argv[1]

db = psycopg2.connect("host=localhost")

dataset_ids = []
dataset_names = []
division_id = None

c = db.cursor()
try:
    c.execute("""
        select dataset.id as dataset_id
             , dataset.division_id
             , substring(dataset.name, length(%(project_name)s) + 2) as dataset_name
        from dataset
        where dataset.name like %(project_name)s||':%%'""", {
            "project_name": project_name
        }
    )
    for dataset_id, this_division_id, dataset_name in c:
        if division_id is None:
            division_id = this_division_id
        elif division_id != this_division_id:
            raise Exception("We do not yet support dumping projects that use more than one division")
        dataset_ids.append(dataset_id)
        dataset_names.append(dataset_name)
finally:
    c.close()

# Load in the country -> continent mapping
continent_by_country = {}
name_by_country = {}
with open("cartograms/data/continents.csv", 'r') as f:
    r = csv.reader(f)
    r.next() # Skip header line
    for iso2, country_name, continent_name, continent_index in r:
        continent_by_country[iso2] = continent_name
        name_by_country[iso2] = country_name

# Load in the data
data = {}
c = db.cursor()
try:
    c.execute("""
        select region_id
             , dataset_id
             , value
        from data_value
        where dataset_id in ({dataset_ids})
        """.format(dataset_ids=",".join(map(str, dataset_ids)))
    )
    for region_id, dataset_id, value in c:
       data.setdefault(dataset_id, {})[region_id] = value
finally:
    c.close()


w = csv.writer(sys.stdout)
w.writerow([
    "key", "country_name", "continent"
] + dataset_names)

c = db.cursor()
try:
    c.execute("""
        select region.id
             , region.name
        from region
        where division_id = %s
        """, (division_id,)
    )
    for region_id, region_name in c:
        w.writerow([
            region_name,
            name_by_country[region_name],
            continent_by_country[region_name]
        ] + [data[x].get(region_id) for x in dataset_ids])
finally:
    c.close()
