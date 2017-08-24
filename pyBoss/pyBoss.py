# PyBoss
import os
import csv

# Set path for files
csvpath = os.path.join("PythonCode/python-challenge/pyBoss/employee_data1.txt")
file_to_output = "employee_data_final.csv"

# Read CSV files
with open(csvpath, newline="") as csvfile:
    csvreader= csv.reader(csvfile, delimiter=",")
    
# Test import
    for row in csvreader:
        #print(row[1])

# Split first and last names


# Convert date format with datetime module
import datetime

datetime.datetime.strptime("1985-12-04", "%Y-%m-%d").strftime("%d/%m/%Y")

# Hide the first five SSN numbers from view


# Change state to two-letter abbreviations