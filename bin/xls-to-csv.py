#!/usr/bin/python
# -*- encoding: utf-8 -*-

import csv
import errno
import logging
import os
import re
import sys

import xlrd


def mkpath(path):
    try:
        os.makedirs(path)
    except OSError, e:
        # It’s fine for the directory already to exist
        if e.errno != errno.EEXIST:
            raise

def cell(value):
    if isinstance(value, unicode):
        return value.encode("utf-8")
    else:
        return str(value)

def convert(input_file, output_dir):
    logging.info("Converting %s", input_file)
    mkpath(output_dir)
    book = xlrd.open_workbook(input_file)
    for sheet in book.sheets():
        logging.info("    converting '%s'", sheet.name)
        with open(os.path.join(output_dir, sheet.name + ".csv"), 'w') as f:
            w = csv.writer(f)
            for r in range(sheet.nrows):
                w.writerow([cell(sheet.cell_value(r, c)) for c in range(sheet.ncols)])

def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    for csv_filename in sys.argv[1:]:
      output_directory = re.sub(r"\.xlsx?$", "", csv_filename)
      convert(csv_filename, output_directory)

if __name__ == "__main__":
    main()
