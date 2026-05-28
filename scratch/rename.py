import os
import re

directory = '/Users/raunitjha/Documents/helium'

replacements = [
    (r'(?i)neon\s*10', 'RetailStacker'),
    (r'(?i)neon-10', 'RetailStacker'),
    (r'neon10', 'retailstacker'),
    (r'Neon10', 'RetailStacker'),
    (r'neon_10', 'retailstacker'),
]

# We want to do cases carefully:
# "Neon 10" -> "RetailStacker"
# "Neon10" -> "RetailStacker"
# "neon10" -> "retailstacker"

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    new_content = content
    # Handle specific casings first
    new_content = new_content.replace('Neon 10', 'RetailStacker')
    new_content = new_content.replace('Neon10', 'RetailStacker')
    new_content = new_content.replace('Neon-10', 'RetailStacker')
    new_content = new_content.replace('neon 10', 'retailstacker')
    new_content = new_content.replace('neon10', 'retailstacker')
    new_content = new_content.replace('neon-10', 'retailstacker')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(directory):
    if 'node_modules' in root or '.git' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html')):
            replace_in_file(os.path.join(root, file))
