#!/usr/bin/python
# -*- encoding: utf-8 -*-
from __future__ import division

"""Download the translations from Google Drive and convert to JSON.
"""

import csv
import json
import urllib2

import markdown

CSV_URL = "https://docs.google.com/spreadsheets/d/1TwxJ4wQqAoNUH81YM0lfv_yID-h0uYpHV0I6McWeBm8/export?gid=0&single=true&format=csv"

response = urllib2.urlopen(CSV_URL)
r = csv.reader(response)

languages = {}
header = r.next()
for row in r:
	key = row[0]
	if key == "": continue
	for lang, value in zip(header[1:], row[1:]):
		value = value.decode("utf-8")
		if key.startswith("map_text_"):
			value = markdown.markdown(value)
		languages.setdefault(lang, {})[key] = value

print "Writing translations to site/text.json..."
with open("site/text.json", 'w') as out:
	json.dump(languages, out)
