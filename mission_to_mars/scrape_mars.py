# Dependencies
from bs4 import BeautifulSoup
import requests
import pymongo

# Initialize PyMongo to work with MongoDBs
conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)

# Define database and collection
db = client.mars_db
collection = db.items

# URL of page to be scraped
url = "index.html"

# Retrieve page with the requests module
response = requests.get(url)
# Create BeautifulSoup object; parse with 'lxml'
soup = BeautifulSoup(response.text, 'lxml')

# print(soup)
# Examine the results, then determine element that contains sought info
# scrape results are returned as an iterable list
scrape = soup.find_all('li', class_='result-row')

# Display items in MongoDB collection
listings = mars_db.items.find()

for listing in listings:
    print(listing)