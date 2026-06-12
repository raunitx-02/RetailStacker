import cv2

img = cv2.imread("/Users/raunitjha/Documents/helium/scratch/frames/frame_30.jpg")
h, w, c = img.shape

# Crop around the white modal box in the middle
# It starts around y = 0.08*h to 0.90*h, x = 0.30*w to 0.78*w
ymin, ymax = int(0.05 * h), int(0.92 * h)
xmin, xmax = int(0.30 * w), int(0.78 * w)

cropped = img[ymin:ymax, xmin:xmax]
cv2.imwrite("/Users/raunitjha/Documents/helium/scratch/frames/cropped_modal.jpg", cropped)
print("Saved cropped_modal.jpg")
