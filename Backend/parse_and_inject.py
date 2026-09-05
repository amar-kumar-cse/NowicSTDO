import json
import sqlite3
import re
import random

data_file = r'C:\Users\Asus\.gemini\antigravity-ide\brain\1810db71-6e9e-49fd-9cfa-5a33ca325207\scratch\extracted_data_utf8.jsonl'
db_path = r'C:\Users\Asus\Desktop\NowicME\NowicSTDO\Backend\dev.sqlite3'

icons = ['Rocket', 'Bot', 'Layers', 'Gauge', 'Cpu', 'Code2', 'Sparkles', 'Globe', 'Zap', 'Trophy', 'Users', 'Star', 'ShieldCheck']

def get_random_icon():
    return random.choice(icons)

def run():
    with open(data_file, 'r', encoding='utf-8') as f:
        content_str = ''
        for line in f:
            if not line.strip(): continue
            try:
                parsed = json.loads(line)
                if parsed.get('type') == 'USER_INPUT' and 'Detailed Services Raw Data Extraction' in parsed.get('content', ''):
                    content_str = parsed['content']
                    break
            except Exception:
                pass

    if not content_str:
        print("Could not find content in jsonl")
        return

    service_blocks = content_str.split('Service: ')[1:]
    
    # We will use quick regex to extract the properties
    mapped_services = []

    for block in service_blocks:
        lines = block.split('\n')
        slug = lines[0].strip()
        
        # Regex to find JSON-like objects in the code
        # Because the user provided it as JS code, Python regex is easiest for extraction.
        # But honestly, we can just write a quick JS script and run it in a node context where we install sqlite3?
        # Actually it's faster to run it with node by running `npm install sqlite3` in a temp folder.
        pass

if __name__ == '__main__':
    run()
