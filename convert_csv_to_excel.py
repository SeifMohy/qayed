import pandas as pd
import os

# Set paths
csv_path = "public/example_data/qnb_new.csv"
excel_path = "public/example_data/qnb.xlsx"

try:
    # Check if file exists
    if os.path.exists(csv_path):
        print(f"CSV file found at {csv_path}")
        
        # Read CSV file
        df = pd.read_csv(csv_path)
        print(f"Successfully read CSV with {len(df)} rows and {len(df.columns)} columns")
        
        # Save to Excel
        df.to_excel(excel_path, index=False)
        print(f"Successfully converted CSV to Excel: {excel_path}")
        
    else:
        print(f"CSV file not found at {csv_path}")
        
except Exception as e:
    print(f"Error: {str(e)}")
