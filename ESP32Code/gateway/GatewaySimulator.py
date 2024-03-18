import requests
import json
import random
import time

# Funkcja do generowania losowych wartości dla W, T, X, Y

names = ['g-4df5g6h','g-2432fg']

interval = 2

def generate_random_values():
    return {
        "W": random.randint(0, 100),
        "T": random.randint(-20, 45)
    }

# Dane JSON do wysłania
with open("ESP32Code/gateway/config.json", "r") as f:
    # Wczytaj dane JSON do zmiennej
    data = json.load(f)

interval = int(data["config"]["interval"])
print(interval)

while True:
    for node_id, node_data in data["Nodes"].items():
        random_values = generate_random_values()
        node_data["W"] = random_values["W"]
        node_data["T"] = random_values["T"]

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