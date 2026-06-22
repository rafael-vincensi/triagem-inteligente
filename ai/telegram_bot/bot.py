from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)

from dotenv import load_dotenv
import requests
import os

load_dotenv()

TOKEN = os.getenv("BOT_TOKEN")

usuarios = {}


async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    usuarios[update.effective_user.id] = {
        "etapa": "nome"
    }

    await update.message.reply_text(
        "Bem-vindo à Triagem Inteligente.\n\n"
        "Informe seu nome:"
    )


async def responder(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    user_id = update.effective_user.id
    texto = update.message.text

    if user_id not in usuarios:

        await update.message.reply_text(
            "Digite /start para iniciar."
        )
        return

    etapa = usuarios[user_id]["etapa"]

    if etapa == "nome":

        usuarios[user_id]["nome"] = texto
        usuarios[user_id]["etapa"] = "idade"

        await update.message.reply_text(
            "Informe sua idade:"
        )

    elif etapa == "idade":

        usuarios[user_id]["idade"] = int(texto)
        usuarios[user_id]["etapa"] = "telefone"

        await update.message.reply_text(
            "Informe seu telefone:"
        )

    elif etapa == "telefone":

        usuarios[user_id]["telefone"] = texto
        usuarios[user_id]["etapa"] = "sintomas"

        await update.message.reply_text(
            "Descreva seus sintomas:"
        )

    elif etapa == "sintomas":

        usuarios[user_id]["sintomas"] = texto

        await update.message.reply_text(
            "⏳ Realizando triagem..."
        )

        resposta = requests.post(
            "http://127.0.0.1:8000/triagem",
            json={
                "nome": usuarios[user_id]["nome"],
                "idade": usuarios[user_id]["idade"],
                "telefone": usuarios[user_id]["telefone"],
                "sintomas": usuarios[user_id]["sintomas"]
            }
        )

        dados = resposta.json()

        if dados["classificacao"] == "vermelho":

            mensagem = f"""
🚨 Atenção

Protocolo: {dados['codigo']}

Os sintomas informados podem indicar uma situação que requer atendimento imediato.

Procure o serviço de emergência mais próximo o quanto antes e informe o protocolo acima à equipe responsável.
"""

        elif dados["classificacao"] == "amarelo":

            mensagem = f"""
⚠️ Atenção

Protocolo: {dados['codigo']}

Foram identificados sintomas que merecem avaliação médica prioritária.

Recomenda-se procurar atendimento o mais breve possível e informar o protocolo acima à equipe responsável.
"""

        else:

            mensagem = f"""
✅ Pré-triagem concluída

Protocolo: {dados['codigo']}

Seu atendimento foi registrado com sucesso.

Ao chegar à unidade de saúde, informe o protocolo acima à equipe responsável.
"""

        await update.message.reply_text(
            mensagem
        )

        del usuarios[user_id]


def main():

    app = Application.builder().token(
        TOKEN
    ).build()

    app.add_handler(
        CommandHandler(
            "start",
            start
        )
    )

    app.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            responder
        )
    )

    print("BOT INICIADO")

    app.run_polling()


if __name__ == "__main__":
    main()