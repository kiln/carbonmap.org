#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

"""Compute emissions change (%) from the Glen Peters “Territorial Emissions” data.
"""

import csv
import sys

FROM_YEAR = 1990
TO_YEAR = 2013

def percentage_change(value_from, value_to):
	return 100.0 * ((value_to / value_from) - 1)

header, from_data, to_data = None, None, None
with open(sys.argv[1], 'r') as f:
	r = csv.reader(f)
	for row in r:
		if header is None and row[1] == "Afghanistan":
			header = row
			header[0] = "Year"
		elif header is not None:
			data = dict(zip(header, row))
			year = int(float(data["Year"]))
			if year == FROM_YEAR:
				from_data = data
			elif year == TO_YEAR:
				to_data = data

if from_data is None:
	raise Exception("No data found for year: " + FROM_YEAR)
if to_data is None:
	raise Exception("No data found for year: " + TO_YEAR)

w = csv.writer(sys.stdout)
w.writerow(["Country Name", "Value"])
for country in header[1:]:
	if from_data[country] and to_data[country]:
		w.writerow([country, percentage_change(float(from_data[country]), float(to_data[country]))])
