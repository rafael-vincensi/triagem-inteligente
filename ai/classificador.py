from ollama import chat
from ai.semantic_search import buscar_contexto


def classificar_sintomas(sintomas):

    contexto = buscar_contexto(
        sintomas
    )

    resposta = chat(
        model="mistral",
        messages=[
            {
                "role": "system",
                "content": f"""
Você é um sistema de triagem baseado no Protocolo de Manchester simplificado.

Casos semelhantes encontrados:

{contexto}

Utilize os exemplos acima como referência para classificar o novo paciente.

Regras:

- Vermelho = risco imediato de vida
- Amarelo = urgência moderada
- Verde = casos sem risco imediato

Retorne SOMENTE:

CLASSIFICACAO:
PRIORIDADE:
ENCAMINHAMENTO:
"""
            },
            {
                "role": "user",
                "content": sintomas
            }
        ]
    )

    return resposta["message"]["content"]