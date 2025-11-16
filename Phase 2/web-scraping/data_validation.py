import json
import csv

INPUT_JSON = ''
OUTPUT_CSV = 'US_Colleges.csv'

def json_to_csv(json_file=INPUT_JSON, csv_out=OUTPUT_CSV):
    with open(json_file, 'r') as f:
        data = json.load(f)

    if not data:
        print("JSON file is empty.")
        return
    
    print(f"Successfully read {len(data)} records from {json_file}")
    
    with open(csv_out, 'w', newline='') as f:
        writer = csv.writer(f)
        # Write header
        writer.writerow(data[0].keys())
        # Write data rows
        for entry in data:
            writer.writerow(entry.values())

    print(f"Data successfully written to {csv_out}")

  
def get_longest_field_lengths(json_file):
    with open(json_file, 'r') as f:
        data = json.load(f)

    if not data:
        print("JSON file is empty.")
        return

    print(f"Successfully read {len(data)} records from {json_file}")

    # Dictionary to store the maximum length for each field
    field_lengths = {}

    # Counter for lines missing values for all three fields
    incomplete_lines_count = 0

    for entry in data:
        # Check if any of the three fields are missing or empty
        field_names = data[0].keys() if data else []

        if all(entry.get(field) for field in field_names):
            print(entry.get('room', 'Unknown Entry'))
            incomplete_lines_count += 1

        for key, value in entry.items():
            value_length = len(str(value))  # Convert value to string and get its length
            if key not in field_lengths:
                field_lengths[key] = value_length
            else:
                field_lengths[key] = max(field_lengths[key], value_length)

    print("Longest value lengths for each field:")
    for field, length in field_lengths.items():
        print(f"{field}: {length}")

    print(f"Number of lines missing values for all fields: {incomplete_lines_count}")


if __name__ == "__main__":
    # json_to_csv()
    get_longest_field_lengths(INPUT_JSON)