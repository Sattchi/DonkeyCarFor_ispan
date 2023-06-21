import cv2
from ultralytics import YOLO
import numpy as np
import pandas as pd
from tracker import *

mytracker=Tracker()
# Load the YOLOv8 model
#model = YOLO('best.pt')
model = YOLO('yolov8n.pt')
# Open the video file
video_path = "video/donkeyCar.mp4"
cap = cv2.VideoCapture(video_path)

area1=[(195,300),(300,300),(300,390),(200,390)]

#area2=[(279,392),(250,397),(423,477),(454,469)]

my_file = open("coco.txt", "r")
data = my_file.read()
class_list = data.split("\n") 

# Loop through the video frames
while cap.isOpened():
    # Read a frame from the video
    success, frame = cap.read()

    if success:
        # Run YOLOv8 inference on the frame
        results = model.predict(frame,verbose=False)
        

        # Visualize the results on the frame
        #annotated_frame = results[0].plot()
        annotated_frame = frame
        a=results[0].boxes.data
        px=pd.DataFrame(a.cpu()).astype("float")
        list=[]
        for index,row in px.iterrows():
            x1=int(row[0])
            y1=int(row[1])
            x2=int(row[2])
            y2=int(row[3])
            d=int(row[5])
            c=class_list[d]
            #print(c)
            if 'skateboard' in c:
                cx=int(x1+x2)//2
                cy=int(y1+y2)//2
                cv2.circle(annotated_frame, (cx,cy), 5, (0,0,225), -1)#劃出框框的中心
                results2=cv2.pointPolygonTest(np.array(area1,np.int32),((cx,cy)),False)
                #print(results2)
                if results2 > 0:
                    print('經過框裡')

        # Display the annotated frame
        cv2.polylines(annotated_frame,[np.array(area1,np.int32)],True,(255,0,0),2)
        cv2.imshow("YOLOv8 Inference", annotated_frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        # Break the loop if the end of the video is reached
        break

# Release the video capture object and close the display window
cap.release()
cv2.destroyAllWindows()
