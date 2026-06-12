import cv2
import os

video_path = "/Users/raunitjha/Downloads/WhatsApp Video 2026-06-02 at 21.10.32.mp4"
output_dir = "/Users/raunitjha/Documents/helium/scratch/frames"
os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps

print(f"FPS: {fps}, Total Frames: {total_frames}, Duration: {duration}s")

# Extract frames at different percentages of the video
for percent in [10, 20, 30, 40, 50, 60, 70, 80, 90]:
    frame_idx = int(total_frames * (percent / 100))
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if ret:
        output_path = os.path.join(output_dir, f"frame_{percent}.jpg")
        cv2.imwrite(output_path, frame)
        print(f"Saved {output_path}")

cap.release()
