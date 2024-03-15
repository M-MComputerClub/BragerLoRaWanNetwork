import json
import random

# Otwórz plik JSON w trybie odczytu
with open("ESP32_code/config.json", "r") as f:
    # Wczytaj dane JSON do zmiennej
    data = json.load(f)

# Wydrukuj zawartość zmiennej
# i = "g-4df5g6h"
print(data["Gates"])

# for i in data["Gates"]:
#     print("\nGatway nazywa się: "+i)
#     print("Odebrał node o nazwie: ")
#     print(data["Gates"][i])

names = ['g-4df5g6h','g-2432fg']

for node_id, node_data in data["Nodes"].items():
    # Generowanie losowych wartości dla Nodes
    node_data["GatewayDevId"] = names[random.randint(0, 1)]
    print(node_data)
    #for node_id, node_data in gate_data["Nodes"].items():
    #    print()

