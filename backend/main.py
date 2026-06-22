from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import re
from database import SessionLocal, engine
from models import Base, Paciente

import time

import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from ai.classificador import classificar_sintomas

Base.metadata.create_all(bind=engine)

print("TABELAS CRIADAS")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TriagemRequest(BaseModel):
    nome: str
    idade: int
    telefone: str
    sintomas: str

class AtualizarClassificacao(BaseModel):
    classificacao: str
    prioridade: int
    encaminhamento: str

print("HORA CADASTRO:", datetime.now())

@app.post("/triagem")
def triagem(data: TriagemRequest):

    inicio = time.time()

    sintomas = data.sintomas.lower()

    resultado_ia = classificar_sintomas(
        data.sintomas
    )

    fim = time.time()

    print(
        f"IA demorou: {fim - inicio:.2f}s"
    )

    print("RESULTADO IA:")
    print(resultado_ia)

    linhas = resultado_ia.split("\n")

    classificacao = "verde"
    prioridade = 3
    encaminhamento = "consulta"
    justificativa = ""

    for linha in linhas:

        linha = linha.strip()

        if "CLASSIFICA" in linha.upper():

            classificacao = (
                 linha.split(":")[1]
                .strip()
                .lower()
)

            classificacao = (
                classificacao
                .split("(")[0]
                .strip()
)

        elif "PRIORIDADE" in linha.upper():

            numero = re.search(
                r"\d+",
                linha
            )

            if numero:

                prioridade = int(
                    numero.group()
                )

        elif "ENCAMINHAMENTO" in linha.upper():

            encaminhamento = (
                linha.split(":")[1]
                .strip()
            )
        elif "JUSTIFICATIVA" in linha.upper():

            justificativa = (
                linha.split(":")[1]
                .strip()
    )

    db: Session = SessionLocal()

    db: Session = SessionLocal()

    ultimo_paciente = (
        db.query(Paciente)
        .order_by(Paciente.id.desc())
        .first()
    )

    if ultimo_paciente:
        proximo_numero = ultimo_paciente.id + 1
    else:
        proximo_numero = 1

    codigo = f"TR-{proximo_numero:04d}"

    paciente = Paciente(
        codigo=codigo,
        nome=data.nome,
        idade=data.idade,
        telefone=data.telefone,
        sintomas=data.sintomas,
        classificacao=classificacao,
        prioridade=prioridade,
        encaminhamento=encaminhamento,
        justificativa=justificativa,
        status="Aguardando",
        data_entrada=datetime.now()
    )
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    db.close()

    return {
        "id": paciente.id,
        "codigo": paciente.codigo,
        "nome": paciente.nome,
        "classificacao": paciente.classificacao,
        "prioridade": paciente.prioridade,
        "encaminhamento": paciente.encaminhamento,
        "status": paciente.status
    }


@app.get("/fila")
def fila():

    db: Session = SessionLocal()

    try:

        pacientes = (
            db.query(Paciente)
            .order_by(Paciente.prioridade)
            .all()
        )

        return pacientes

    finally:
        db.close()

@app.get("/paciente/{id}")
def buscar_paciente(id: int):

    db: Session = SessionLocal()

    try:

        paciente = (
            db.query(Paciente)
            .filter(Paciente.id == id)
            .first()
        )

        return paciente

    finally:
        db.close()

@app.put("/paciente/{id}/classificacao")
def atualizar_classificacao(
    id: int,
    dados: AtualizarClassificacao
):

    db: Session = SessionLocal()

    try:

        paciente = (
            db.query(Paciente)
            .filter(Paciente.id == id)
            .first()
        )

        paciente.classificacao = dados.classificacao
        paciente.prioridade = dados.prioridade
        paciente.encaminhamento = dados.encaminhamento

        db.commit()

        return {
            "mensagem": "Classificação atualizada"
        }

    finally:
        db.close()

@app.put("/paciente/{id}/observacao")
def atualizar_observacao(id: int, observacao: str):

    db: Session = SessionLocal()

    try:

        paciente = (
            db.query(Paciente)
            .filter(Paciente.id == id)
            .first()
        )

        paciente.observacoes = observacao

        db.commit()

        return {
            "mensagem": "Observação atualizada"
        }

    finally:
        db.close()

@app.put("/paciente/{id}/status")
def atualizar_status(id: int, status: str):

    db: Session = SessionLocal()

    try:

        paciente = (
            db.query(Paciente)
            .filter(Paciente.id == id)
            .first()
        )

        paciente.status = status

        db.commit()

        return {
            "mensagem": "Status atualizado"
        }

    finally:
        db.close()