import json
import time
import random

while True:
    # Generowanie losowej temperatury
    temperatura = round(random.uniform(-30, 30), 2)
    wilgotnosc = round(random.uniform(0, 100), 2)
    
    # Zapisywanie temperatury i wilgotności do jednego słownika
    dane = {'temperatura': temperatura, 'wilgotnosc': wilgotnosc}
    
    # Zapisywanie danych do pliku JSON
    with open('dane.json', 'w') as plik:
        json.dump(dane, plik)
    
    # Oczekiwanie 5 minut
    time.sleep(2)  # Oczekiwanie 5 minut (300 sekund)