print("TESTE")

from ollama import chat

print("IMPORTOU")

print("ENVIANDO PARA IA...")

resposta = chat(
    model="mistral",
    messages=[
        {
            "role": "user",
            "content": "Responda apenas a palavra funcionando"
        }
    ]
)

print("RECEBI RESPOSTA")

print(resposta["message"]["content"])