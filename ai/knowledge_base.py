import json
import os
import chromadb

cliente = chromadb.PersistentClient(
    path="./chroma_db"
)

try:
    cliente.delete_collection(
        name="triagem"
    )
except:
    pass

colecao = cliente.get_or_create_collection(
    name="triagem"
)

caminho = os.path.join(
    os.path.dirname(__file__),
    "..",
    "dataset",
    "casos_triagem.json"
)

with open(
    caminho,
    "r",
    encoding="utf-8"
) as arquivo:

    casos = json.load(arquivo)

for i, caso in enumerate(casos):

    colecao.add(
        ids=[str(i)],
        documents=[
            caso["sintomas"]
        ],
        metadatas=[
            {
                "classificacao":
                caso["classificacao"],

                "prioridade":
                caso["prioridade"],

                "encaminhamento":
                caso["encaminhamento"]
            }
        ]
    )

print(
    f"{len(casos)} casos inseridos."
)