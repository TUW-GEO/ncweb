"""
Created on May 9, 2013

@author: SHahn
"""

import platform

if platform.system() == "Linux":
    c = "/media/sf_C/"
    d = "/media/sf_D/"
    h = "/media/sf_H/"
    r = "/media/sf_R/"
    x = "/media/sf_X/"
    
if platform.system() == "Windows":
    c = "C:\\"
    d = "D:\\"
    h = "H:\\"
    r = "R:\\"
    x = "X:\\"