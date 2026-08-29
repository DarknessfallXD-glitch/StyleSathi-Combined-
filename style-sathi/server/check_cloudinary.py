import os
os.environ['SUPABASE_PROJECT_URL'] = 'https://oqdpwtyjbgzufeblrnww.supabase.co'
os.environ['SUPABASE_SERVICE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZHB3dHlqYmd6dWZlYmxybnd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMjgzMywiZXhwIjoyMDk3MTk4ODMzfQ.MBx9wCLKi44m6_VHPypasyugulIQALkU8EN9G7qIiaw'

from supabase import create_client

supabase = create_client(os.environ['SUPABASE_PROJECT_URL'], os.environ['SUPABASE_SERVICE_KEY'])

# Get curated products with Cloudinary URLs
result = supabase.table('products').select('id,title,image_url,source').eq('source', 'curated').like('image_url', '%cloudinary%').execute()
for p in result.data:
    print(p['title'] + ': ' + p['image_url'])
print('Total: ' + str(len(result.data)))