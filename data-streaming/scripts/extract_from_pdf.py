import fitz  # PyMuPDF
from pymongo import MongoClient
from config.settings import MONGO_URL

client = MongoClient(MONGO_URL)
db = client['city_dashboard']
budget_collection = db['budgets']

def extract_text_from_pdf(pdf_path):
    with fitz.open(pdf_path) as pdf:
        text = ""
        for page in pdf:
            text += page.get_text()
        return text

def process_budget_pdf(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    budget_data = {"pdf_name": pdf_path, "content": text}
    budget_collection.insert_one(budget_data)
    print(f"Processed and stored data from {pdf_path}")

if __name__ == "__main__":
    pdf_path = '../manual_data/pdfs/budget2024.pdf'
    process_budget_pdf(pdf_path)
