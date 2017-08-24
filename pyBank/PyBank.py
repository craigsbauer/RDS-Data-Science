# PyBank
import os
import csv

# Set path for files
csvpath = os.path.join("Resources/budget_data_1.csv")
file_to_output = "analysis/budget_analysis_1.txt"

# Variables
Total_Months = 0
Total_Revenue = 0
Average_Revenue_Change = 0
Greatest_Revenue_Increase = ["", 0]
Greatest_Revenue_Decrease = ["", 9999999999999999999999]

revenue_changes = []

# Read CSV files
with open(csvpath, newline="") as csvfile:
    csvreader= csv.reader(csvfile, delimiter=",")
    
#Test import
    for row in csvreader:
        #print(row[1])



# Calculate
    Total_Months = Total_Months + 1
    Total_Revenue = Total_Revenue + int(row["Revenue"])
      

# Test Output
    print("Total Months: " + str(Total_Months))
    print("Total Revenue: " + str(Total_Revenue))


 # Keep track of changes
        revenue_change = int(row["Revenue"]) - prev_revenue
        # print(revenue_change)

        # Reset the value of prev_revenue to the row I completed my analysis
        prev_revenue = int(row["Revenue"])
        # print(prev_revenue)

        # Determine the greatest increase
        if (revenue_change > greatest_increase[1]):
            greatest_increase[1] = revenue_change
            greatest_increase[0] = row["Date"]

        if (revenue_change < greatest_decrease[1]):
            greatest_decrease[1] = revenue_change
            greatest_decrease[0] = row["Date"]

        # Add to the revenue_changes list
        revenue_changes.append(int(row["Revenue"]))

    # Set the Revenue average
    revenue_avg = sum(revenue_changes) / len(revenue_changes)

# Show Output
    print("Total Months: " + str(total_months))
    print("Total Revenue: " + str(total_revenue))
    print("Greatest Increase: " + str(greatest_increase[1]) + " in " + str(greatest_increase[0]))
    print("Greatest Decrease: " + str(greatest_decrease[1]) + " in " + str(greatest_decrease[0]))
    print("Average Change: " + str(sum(revenue_changes) / len(revenue_changes)))
