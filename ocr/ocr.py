import cv2
import easyocr

img = cv2.imread("timetable.png")

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = cv2.bitwise_not(gray)
gray = cv2.resize(gray, None, fx=2, fy=2)

reader = easyocr.Reader(['en'])
results = reader.readtext(gray)

lines = []
for (bbox, txt, prob) in results:
    lines.append(txt.strip())

times = ["9-10","10-11","11-12","12-1","2-3","3-4"]

days = ["monday","tuesday","wednesday","thursday","friday"]

free_slots = {}

for i in range(len(lines)):

    if lines[i].lower() in days:

        day = lines[i]
        schedule = lines[i+1:i+7]

        free_list = []

        for j in range(len(schedule)):
            if "free" in schedule[j].lower():
                free_list.append(times[j])

        free_slots[day] = free_list

print("Free Slot Dictionary:\n")
print(free_slots)

