import os
import time

for p in range(2):
# Fork process
    pid = os.fork()
    if pid == 0:
        os.execl('player.py','')

    # Breathe
    time.sleep(3)
