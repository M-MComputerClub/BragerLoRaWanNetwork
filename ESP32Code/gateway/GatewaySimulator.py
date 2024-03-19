import requests
import json
import random
import time

# Funkcja do generowania losowych wartości dla W, T, X, Y

names = ['g-4df5g6h','g-2432fg']

interval = 2

# Dane JSON do wysłania
with open("ESP32Code/gateway/config.json", "r") as f:
    # Wczytaj dane JSON do zmiennej
    data = json.load(f)

interval = int(data["config"]["interval"])

for gate_id, gate_data in data["Gates"].items():            
    # Adres URL serwera Node
    url = "http://localhost:4001/api/config"

    # Nagłówek żądania
    headers = {'Content-Type': 'application/json'}

    # Wysłanie żądania POST
    print(gate_data)
    response = requests.post(url, headers=headers, data=json.dumps(gate_data))

    # Sprawdzenie statusu odpowiedzi
    if response.status_code == 200:
        print("Dane wysłane pomyślnie!")
    else:
        print("Błąd:", response.status_code, response.text)
    time.sleep(interval)

while True:
    for node_id, node_data in data["Nodes"].items():
        node_data["W"] = random.randint(0, 100)
        node_data["T"] = random.randint(-20, 45)

        node_data["GatewayDevId"] = names[random.randint(0, 1)]
                
        # Adres URL serwera Node
        url = "http://localhost:4001/api/dane"

        # Nagłówek żądania
        headers = {'Content-Type': 'application/json'}

        # Wysłanie żądania POST
        print(data["Nodes"])
        response = requests.post(url, headers=headers, data=json.dumps(node_data))

        # Sprawdzenie statusu odpowiedzi
        if response.status_code == 200:
            print("Dane wysłane pomyślnie!")
        else:
            print("Błąd:", response.status_code, response.text)
        time.sleep(interval)