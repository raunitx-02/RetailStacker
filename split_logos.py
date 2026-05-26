from PIL import Image
import os

img_path = '/Users/raunitjha/.gemini/antigravity/brain/81a816e8-a492-492f-8c45-81283f2c8602/media__1779803199585.png'
img = Image.open(img_path).convert("RGBA")
w, h = img.size
print(f"Dimensions: {w}x{h}")
