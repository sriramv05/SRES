import firebase_admin
from firebase_admin import credentials, firestore
import tkinter as tk
import time
import threading

print("Starting Traffic Signal Simulator...")

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
print("Connected to Firestore")

doc_ref = db.collection("trafficSignals").document("signal1")

# ---------------- GUI ----------------

root = tk.Tk()
root.title("Traffic Signal")

canvas = tk.Canvas(root, width=200, height=400, bg="black")
canvas.pack()

red_light = canvas.create_oval(50, 50, 150, 150, fill="gray")
yellow_light = canvas.create_oval(50, 160, 150, 260, fill="gray")
green_light = canvas.create_oval(50, 270, 150, 370, fill="gray")

# ------------ Update Function ------------

def update_signal():

    while True:

        doc = doc_ref.get()

        if doc.exists:

            status = doc.to_dict()["status"]

            print("Signal Status:", status)

            canvas.itemconfig(red_light, fill="gray")
            canvas.itemconfig(yellow_light, fill="gray")
            canvas.itemconfig(green_light, fill="gray")

            if status == "red":
                canvas.itemconfig(red_light, fill="red")

            elif status == "yellow":
                canvas.itemconfig(yellow_light, fill="yellow")

            elif status == "green":
                canvas.itemconfig(green_light, fill="green")

        time.sleep(2)

# Thread for Firestore listening
thread = threading.Thread(target=update_signal)
thread.daemon = True
thread.start()

# Run GUI
root.mainloop()