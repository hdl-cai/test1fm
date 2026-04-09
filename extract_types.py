import json
import os

input_path = r'C:\Users\CAI\.gemini\antigravity\brain\33823f83-ce0a-4ed0-b050-936d1a68e9c0\.system_generated\steps\496\output.txt'
output_path = r'c:\Users\CAI\Documents\Flockmate Repo\branches\test\flockmate\src\types\supabase.ts'

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(data['types'])

print(f"Successfully updated {output_path}")
