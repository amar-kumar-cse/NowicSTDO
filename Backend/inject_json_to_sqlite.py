import sqlite3
import json

db_path = r'C:\Users\Asus\Desktop\NowicME\NowicSTDO\Backend\dev.sqlite3'
json_path = r'C:\Users\Asus\Desktop\NowicME\NowicSTDO\Backend\mapped_services.json'

def run():
    with open(json_path, 'r', encoding='utf-8') as f:
        mapped_services = json.load(f)
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT data FROM core_sitecontent WHERE section = 'services'")
    row = cursor.fetchone()
    if not row:
        print("No services section found in DB!")
        return
        
    existing_services = json.loads(row[0])
    
    for existing in existing_services:
        new_data = next((m for m in mapped_services if m['slug'] == existing['slug']), None)
        if new_data:
            existing['heroContent'] = new_data.get('heroContent')
            existing['introduction'] = new_data.get('introduction')
            existing['subServices'] = new_data.get('subServices')
            existing['process'] = new_data.get('process')
            existing['whyChooseUs'] = new_data.get('whyChooseUs')
            existing['faqs'] = new_data.get('faqs')
            
    updated_json = json.dumps(existing_services)
    
    cursor.execute("UPDATE core_sitecontent SET data = ? WHERE section = 'services'", (updated_json,))
    conn.commit()
    conn.close()
    print("Successfully updated SQLite with real data!")

if __name__ == '__main__':
    run()
