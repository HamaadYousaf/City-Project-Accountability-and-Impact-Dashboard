import pandas as pd

def transform_project_data(raw_data):
    df = pd.DataFrame(raw_data)
    df['original_completion_date'] = pd.to_datetime(df['original_completion_date']).dt.strftime('%Y-%m-%d')
    df['current_completion_date'] = pd.to_datetime(df['current_completion_date']).dt.strftime('%Y-%m-%d')
    return df.to_dict(orient='records')

if __name__ == "__main__":
    raw_data = [
        {
            "original_completion_date": "2024-06-01",
            "current_completion_date": "2024-12-01",
            "project_name": "Highway Expansion",
            "status": "Under Construction",
        }
    ]
    transformed_data = transform_project_data(raw_data)
    print(transformed_data)
