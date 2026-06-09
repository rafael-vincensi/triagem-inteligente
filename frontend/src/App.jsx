import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [pacientes, setPacientes] = useState([]);
  const [detalhes, setDetalhes] = useState(null);
  const [novaObservacao, setNovaObservacao] = useState("");
  const [novoStatus, setNovoStatus] = useState("");

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("fila");
  const [busca, setBusca] = useState("");
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {

    function carregarFila() {

      fetch("http://127.0.0.1:8000/fila")
        .then((response) => response.json())
        .then((data) => setPacientes(data));

    }

    carregarFila();

    const intervalo = setInterval(
      carregarFila,
      5000
    );

    return () => clearInterval(intervalo);

  }, []);

  async function salvarTudo() {

  await salvarStatus();

  await salvarObservacao();

  
    setModalDetalhes(false);

}

  async function verDetalhes(id) {

    const response = await fetch(
      `http://127.0.0.1:8000/paciente/${id}`
    );

    const data = await response.json();

    setDetalhes(data);
    setModalDetalhes(true);
    setNovaObservacao(data.observacoes || "");
    setNovoStatus(data.status || "");
  }

  async function salvarObservacao() {

    await fetch(
      `http://127.0.0.1:8000/paciente/${detalhes.id}/observacao?observacao=${encodeURIComponent(
        novaObservacao
      )}`,
      {
        method: "PUT",
      }
    );

    const response = await fetch(
      `http://127.0.0.1:8000/paciente/${detalhes.id}`
    );

    const data = await response.json();

    setDetalhes(data);
  }

  async function salvarStatus() {

    await fetch(
      `http://127.0.0.1:8000/paciente/${detalhes.id}/status?status=${encodeURIComponent(
        novoStatus
      )}`,
      {
        method: "PUT",
      }
    );

    const response = await fetch(
      `http://127.0.0.1:8000/paciente/${detalhes.id}`
    );

    const data = await response.json();

    setDetalhes(data);
  }

  async function cadastrarPaciente() {

  setCarregando(true);

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/triagem",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          idade: Number(idade),
          telefone,
          sintomas,
        }),
      }
    );

    if (!response.ok) {
      alert("Erro ao cadastrar paciente");
      return;
    }

    setNome("");
    setIdade("");
    setTelefone("");
    setSintomas("");

    const fila = await fetch(
      "http://127.0.0.1:8000/fila"
    );

    const pacientesAtualizados =
      await fila.json();

    setPacientes(
      pacientesAtualizados
    );

    setMostrarCadastro(false);

  } finally {

    setCarregando(false);

  }
}
  const vermelhos = pacientes.filter(
    (p) =>
      p.classificacao === "vermelho" &&
      p.status !== "Finalizado"
  ).length;

  const amarelos = pacientes.filter(
    (p) =>
      p.classificacao === "amarelo" &&
      p.status !== "Finalizado"
  ).length;

  const verdes = pacientes.filter(
    (p) =>
      p.classificacao === "verde" &&
      p.status !== "Finalizado"
  ).length;

  const totalAtivos = pacientes.filter(
    (p) => p.status !== "Finalizado"
  ).length;
  return (
    <div className="container">

      <div className="coluna-esquerda">

        <div className="cabecalho">

          <div className="titulo-area">

            <h1>
              Triagem Inteligente
            </h1>

            {/*<p>
              Sistema de Gestão Hospitalar
            </p>*/}

          </div>

          <button
            className="botao"
            onClick={() =>
              setMostrarCadastro(
                !mostrarCadastro
              )
            }
          >
            {mostrarCadastro
              ? "Novo Paciente"
              : "Novo Paciente"}
          </button>

        </div>

        <br />
        <br />

        <br />
        <br />

        {mostrarCadastro && (

          <div className="modal-fundo">

            <div className="modal">

              <div className="modal-topo">

                <h2>Novo Paciente</h2>

                <button
                  className="botao-fechar"
                  onClick={() =>
                    setMostrarCadastro(false)
                  }
                >
                  X
                </button>

              </div>

              <label>Nome</label>

              <input
                placeholder="Nome"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
              />

              <br />
              <br />

                <label>Idade</label>
              <input
                placeholder="Idade"
                value={idade}
                onChange={(e) =>
                  setIdade(e.target.value)
                }
              />

              <br />
              <br />

              <label>Telefone</label>
              <input
                placeholder="Telefone"
                value={telefone}
                onChange={(e) =>
                  setTelefone(e.target.value)
                }
              />

              <br />
              <br />

              <label>Sintomas</label>
              <textarea
                placeholder="Sintomas"
                value={sintomas}
                onChange={(e) =>
                  setSintomas(e.target.value)
                }
              />

              <br />
              <br />

              <button
                className="botao"
                onClick={cadastrarPaciente}
                disabled={carregando}
              >
  {
    carregando
      ? "Classificando..."
      : "Cadastrar Paciente"
  }
</button>

            </div>

          </div>

        )}

        <h2 className="subtitulo">
          Fila Hospitalar
        </h2>

        <div className="painel-indicadores">

          <div className="indicador vermelho">
            <h2>{vermelhos}</h2>
            <span>Vermelhos</span>
          </div>

          <div className="indicador amarelo">
            <h2>{amarelos}</h2>
            <span>Amarelos</span>
          </div>

          <div className="indicador verde">
            <h2>{verdes}</h2>
            <span>Verdes</span>
          </div>

          <div className="indicador total">
            <h2>{totalAtivos}</h2>
            <span>Total Ativos</span>
          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            marginTop: "20px"
          }}
        >
          <button
            className="botao"
            onClick={() =>
              setAbaSelecionada("fila")
            }
          >
            Fila Ativa
          </button>

          <button
            className="botao"
            onClick={() =>
              setAbaSelecionada("historico")
            }
          >
            Histórico
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nome, telefone ou código"
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          style={{
            padding: "12px",
            width: "100%",
            maxWidth: "500px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "25px"
          }}
        />

        <div className="lista-pacientes">
          {pacientes
            .filter((paciente) => {

              const textoBusca =
                busca.toLowerCase();

              const encontrado =
                paciente.nome
                  .toLowerCase()
                  .includes(textoBusca) ||

                paciente.codigo
                  .toLowerCase()
                  .includes(textoBusca) ||

                paciente.telefone
                  .toLowerCase()
                  .includes(textoBusca);

              if (!encontrado) {
                return false;
              }

              if (abaSelecionada === "fila") {
                return paciente.status !== "Finalizado";
              }

              return paciente.status === "Finalizado";

            })
            .map((paciente) => {


              let classeCard = "card-paciente";

              if (paciente.classificacao === "vermelho") {
                classeCard += " card-vermelho";
              }

              if (paciente.classificacao === "amarelo") {
                classeCard += " card-amarelo";
              }

              if (paciente.classificacao === "verde") {
                classeCard += " card-verde";
              }

              const entrada = new Date(
                paciente.data_entrada
              );

              const agora = new Date();

              const diferencaMinutos = Math.floor(
                (agora - entrada) / 1000 / 60
              );


              let tempoEspera = `${diferencaMinutos} min`;

              if (diferencaMinutos >= 60) {

                const horas = Math.floor(
                  diferencaMinutos / 60
                );

                const minutos =
                  diferencaMinutos % 60;

                tempoEspera =
                  `${horas}h ${minutos}min`;
              }

              return (
                <div
                  key={paciente.id}
                  className={classeCard}
                >
                  <div className="codigo-paciente">
                    {paciente.codigo}
                  </div>

                  <div className="nome-paciente">
                    {paciente.nome}
                  </div>

                  <div className="info-paciente">
                    {paciente.idade} anos
                  </div>

                  <div className="sintomas-card">
                    {paciente.sintomas}
                  </div>

                  <div
  className="classificacao-card"

  style={{
    color:
      paciente.classificacao === "vermelho"
        ? "#d9534f"
        : paciente.classificacao === "amarelo"
        ? "#f0ad4e"
        : "#5cb85c"
  }}
>
  {paciente.classificacao.toUpperCase()}
</div>

<div
  style={{
    marginTop: "6px",
    fontSize: "14px",
    color: "#666"
  }}
>
  Prioridade {paciente.prioridade}
</div>

                  <div className="info-paciente">
                    Status: {paciente.status}
                  </div>

                  <div className="tempo-espera">
                    Tempo de Espera: {tempoEspera}
                  </div>
                  <button
                    className="botao-card"
                    onClick={() =>
                      verDetalhes(
                        paciente.id
                      )
                    }
                  >
                    Ver detalhes
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {modalDetalhes && detalhes && (

        <div className="modal-fundo">

          <div className="modal">

            <div className="modal-topo">

              <h2>
                Detalhes do Paciente
              </h2>

              <button
                className="botao-fechar"
                onClick={() =>
                  setModalDetalhes(false)
                }
              >
                X
              </button>

            </div>


            <div className="detalhe-linha">
              <div className="detalhe-label">
                Código
              </div>

              <div className="detalhe-valor">
                {detalhes.codigo}
              </div>
            </div>

            <div className="detalhe-linha">
              <div className="detalhe-label">
                Nome
              </div>

              <div className="detalhe-valor">
                {detalhes.nome}
              </div>
            </div>

            <div className="detalhe-linha">
              <div className="detalhe-label">
                Idade
              </div>

              <div className="detalhe-valor">
                {detalhes.idade} anos
              </div>
            </div>

            <div className="detalhe-linha">
              <div className="detalhe-label">
                Telefone
              </div>

              <div className="detalhe-valor">
                {detalhes.telefone}
              </div>
            </div>

            <div className="detalhe-linha">
              <div className="detalhe-label">
                Classificação
              </div>

              <div
                className="detalhe-valor"
                style={{
                  fontWeight: "bold",
                  color:
                    detalhes.classificacao === "vermelho"
                      ? "#d9534f"
                      : detalhes.classificacao === "amarelo"
                        ? "#f0ad4e"
                        : "#5cb85c"
                }}
              >
                {detalhes.classificacao.toUpperCase()}
              </div>
            </div>

            <div className="detalhe-linha">
              <div className="detalhe-label">
                Encaminhamento
              </div>

              <div className="detalhe-valor">
                {detalhes.encaminhamento}
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px"
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "#0d3f7a",
                  marginBottom: "8px"
                }}
              >
                Sintomas
              </div>

              <div
                style={{
                  background: "#f5f7fa",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "#222"
                }}
              >
                {detalhes.sintomas}
              </div>
            </div>

            <hr />

            <p>
              <strong>Status:</strong>
            </p>

            <select
              value={novoStatus}
              onChange={(e) =>
                setNovoStatus(
                  e.target.value
                )
              }
            >
              <option value="Aguardando">
                Aguardando
              </option>

              <option value="Em Atendimento">
                Em Atendimento
              </option>

              <option value="Finalizado">
                Finalizado
              </option>
            </select>

            <br />
            <br />


            <hr />

            <p>
              <strong>
                Observações:
              </strong>
            </p>

            <textarea
              rows="5"
              value={novaObservacao}
              onChange={(e) =>
                setNovaObservacao(
                  e.target.value
                )
              }
            />

            <br />
            <br />
            <hr />

            <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "25px"
  }}
>
  <button
    className="botao"
    onClick={salvarTudo}
  >
    Salvar Alterações
  </button>
</div>

            <p>
              <strong>
                Data de Entrada:
              </strong>{" "}
              {
                new Date(
                  detalhes.data_entrada
                ).toLocaleString("pt-BR")
              }
            </p>

          </div>

        </div>

      )}
    </div>
  );
}
export default App;