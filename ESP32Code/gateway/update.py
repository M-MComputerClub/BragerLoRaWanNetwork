import requests
r = requests.post('http://192.168.160.200:80/set_data', data="{'number':55}") # remember that you get the keyword 'number' in the server side
print(r.text) #should print "Some message"
if r.status_code == 200:
    print("Dane wysłane pomyślnie!")
else:
    print("Błąd:", r.status_code, r.text)