import json
import os

caminho = os.path.join(
    os.path.dirname(__file__),
    "..",
    "dataset",
    "casos_triagem.json"
)

print("ARQUIVO:", caminho)

with open(
    caminho,
    "r",
    encoding="utf-8"
) as arquivo:

    casos = json.load(arquivo)

print(f"Total de casos: {len(casos)}")

for caso in casos:

    print()
    print("Sintomas:", caso["sintomas"])
    print("Classificação:", caso["classificacao"])