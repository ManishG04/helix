import cv2
import easyocr

img = cv2.imread("timetable.jpeg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
img = cv2.resize(gray, None, fx=2, fy=2)

reader = easyocr.Reader(['en'])
results = reader.readtext(img)

detections = []
for (bbox, txt, prob) in results:
    cx = int((bbox[0][0] + bbox[2][0]) / 2)
    cy = int((bbox[0][1] + bbox[2][1]) / 2)
    detections.append((cx, cy, txt.lower().strip()))

days  = ["monday", "tuesday", "wednesday", "thursday", "friday"]
times = ["9-10", "10-11", "11-12", "12-1", "2-3", "3-4"]

day_y = {}
for cx, cy, txt in detections:
    if txt in days:
        day_y[txt] = cy
time_x = sorted([cx for cx, cy, txt in detections if abs(cy - header_y) < 50])[1:7]

free_slots = {}

for day in days:
    if day not in day_y:
        continue
    dy = day_y[day]
    free = []
    for i, tx in enumerate(time_x):
        found = False
        for cx, cy, txt in detections:
            if txt in days or txt == "day":
                continue
            if abs(cx - tx) < 80 and abs(cy - dy) < 40:
                found = True
                break

        if not found:
            free.append(times[i])
    free_slots[day] = free

print("\nFree Slots:\n")
for d in free_slots:
    print(d.capitalize(), ":", free_slots[d])