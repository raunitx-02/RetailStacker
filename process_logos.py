from PIL import Image
import os

img_files = [
    '/Users/raunitjha/.gemini/antigravity/brain/81a816e8-a492-492f-8c45-81283f2c8602/media__1779803199584.png',
    '/Users/raunitjha/.gemini/antigravity/brain/81a816e8-a492-492f-8c45-81283f2c8602/media__1779803199585.png',
    '/Users/raunitjha/.gemini/antigravity/brain/81a816e8-a492-492f-8c45-81283f2c8602/media__1779803199597.png'
]

# We will analyze top-left pixel to determine bg color and remove it with tolerance
def remove_bg_and_save(img_path, out_path):
    if not os.path.exists(img_path): return
    img = Image.open(img_path).convert("RGBA")
    
    # Get top-left pixel
    bg_color = img.getpixel((0, 0))
    
    data = img.getdata()
    new_data = []
    tolerance = 50  # generous tolerance for anti-aliasing edge artifacts
    
    for item in data:
        if (abs(item[0] - bg_color[0]) < tolerance and
            abs(item[1] - bg_color[1]) < tolerance and
            abs(item[2] - bg_color[2]) < tolerance):
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path)
    print(f"Processed {img_path} -> {out_path} (bg: {bg_color})")

# We don't know which is which, so let's identify them by color or size
# But actually we can just process them into public/ and map them based on size.
# 1779803199584 (4.5k) -> Meesho
# 1779803199585 (8.1k) -> Amazon
# 1779803199597 (31.6k) -> Shopify
remove_bg_and_save(img_files[0], 'public/meesho-logo-raw.png')
remove_bg_and_save(img_files[1], 'public/amazon-logo-raw.png')
remove_bg_and_save(img_files[2], 'public/shopify-logo-raw.png')

