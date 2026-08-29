import os
os.environ['SUPABASE_PROJECT_URL'] = 'https://oqdpwtyjbgzufeblrnww.supabase.co'
os.environ['SUPABASE_SERVICE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZHB3dHlqYmd6dWZlYmxybnd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMjgzMywiZXhwIjoyMDk3MTk4ODMzfQ.MBx9wCLKi44m6_VHPypasyugulIQALkU8EN9G7qIiaw'
os.environ['CLOUDINARY_CLOUD_NAME'] = 'tfpja2zx'
os.environ['CLOUDINARY_API_KEY'] = '463353791641843'
os.environ['CLOUDINARY_API_SECRET'] = 'Oxu4ZCrCVNJ0ofGD9pIaip4ZpkE'
os.environ['CLOUDINARY_FOLDER'] = 'stylesathi'
os.environ['EMBEDDING_PROVIDER'] = 'local'

from supabase import create_client
from services.search import process_search

supabase = create_client(os.environ['SUPABASE_PROJECT_URL'], os.environ['SUPABASE_SERVICE_KEY'])

# Search for curated products
result = process_search('cotton kurta', supabase, limit=5)
import json
print(json.dumps(result, indent=2, default=str))