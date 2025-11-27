import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Edit } from "lucide-react";

// Função para corrigir URLs do Firebase
function fixFirebaseUrl(url) {
  if (!url) return url;
  if (url.includes("firebasestorage.googleapis.com")) return url;

  try {
    const tokenMatch = url.match(/token=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    const parts = url.split(".app/");
    if (parts.length < 2) return url;

    const path = parts[1].split("?")[0];
    const encodedPath = encodeURIComponent(path);

    let finalUrl = `https://firebasestorage.googleapis.com/v0/b/fixhub-dc44c.firebasestorage.app/o/${encodedPath}?alt=media`;

    if (token) finalUrl += `&token=${token}`;

    return finalUrl;
  } catch (err) {
    console.error("Erro ao ajustar URL do Firebase:", err);
    return url;
  }
}

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscar ticket
  useEffect(() => {
    const fetchTicket = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        Swal.fire("Erro", "Usuário não autenticado. Faça login novamente.", "error");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://projeto-integrador-fixhub.onrender.com/api/fixhub/tickets/detalhes/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error(`Erro: ${response.status}`);

        const data = await response.json();
        data.imagem = fixFirebaseUrl(data.imagem);
        setTicket(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes do ticket:", error);
        Swal.fire("Erro", "Não foi possível carregar os detalhes do ticket.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading)
    return <div className="text-center mt-10 text-gray-500">Carregando...</div>;

  if (!ticket)
    return <div className="text-center mt-10 text-gray-500">Nenhum ticket encontrado.</div>;

  const showResolution =
    ticket.status === "CONCLUIDO" || ticket.status === "REPROVADO";

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-2xl font-bold text-sky-700">
          Detalhes do Ticket #{ticket.idTicket}
        </h2>

        {ticket.status === "PENDENTE" && (
          <button
            onClick={() => navigate(`/reports/edit/${ticket.idTicket}`)}
            className="flex items-center gap-2 px-3 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition shadow-sm"
          >
            <Edit size={18} />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Descrição */}
      <section className="mt-5">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Descrição</h3>
        <div className="p-4 bg-gray-50 rounded-xl border text-gray-600 leading-relaxed shadow-sm">
          {ticket.descricaoTicketUsuario || "Sem descrição"}
        </div>
      </section>

      {/* Localização */}
      <section className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Localização</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm">
            <span className="font-semibold text-gray-700">Andar:</span> {ticket.andar}
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm">
            <span className="font-semibold text-gray-700">Local:</span>{" "}
            {ticket.localizacao}
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm">
            <span className="font-semibold text-gray-700">Área:</span>{" "}
            {ticket.descricaoLocalizacao}
          </div>
        </div>
      </section>

      {/* Prioridade */}
      <section className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Prioridade</h3>
        <div
          className={`
            p-3 rounded-xl border shadow-sm font-semibold
            ${ticket.prioridade === "BAIXA" ? "bg-green-100 text-green-700 border-green-300" : ""}
            ${ticket.prioridade === "REGULAR" ? "bg-yellow-100 text-yellow-600 border-yellow-300" : ""}
            ${ticket.prioridade === "IMPORTANTE" ? "bg-orange-100 text-orange-600 border-orange-300" : ""}
            ${ticket.prioridade === "URGENTE" ? "bg-red-100 text-red-600 border-red-300" : ""}
          `}
        >
          {ticket.prioridade || "—"}
        </div>
      </section>

      {/* Status */}
      <section className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Status</h3>

        <div
          className={`p-3 rounded-lg shadow-sm border-l-4 ${
            ticket.status === "CONCLUIDO"
              ? "border-green-600 bg-green-50 text-green-700"
              : ticket.status === "REPROVADO"
              ? "border-red-600 bg-red-50 text-red-700"
              : ticket.status === "EM ANDAMENTO"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-yellow-500 bg-yellow-50 text-yellow-700"
          }`}
        >
          {ticket.status}
        </div>
      </section>

      {/* Datas */}
      <section className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Datas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm">
            <span className="font-semibold text-gray-700">Criado em:</span>{" "}
            {new Date(ticket.dataTicket).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
          </div>

          {ticket.dataAtualizacao && (
            <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm">
              <span className="font-semibold text-gray-700">Editado em:</span>{" "}
              {new Date(ticket.dataAtualizacao).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </div>
          )}
        </div>
      </section>

      {/* Informações de Resolução */}
      {showResolution && (
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Informações de Resolução
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm">
              <span className="font-semibold text-gray-700">Funcionário:</span>{" "}
              {ticket.nomeFuncionario || "—"}
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm sm:col-span-2">
              <span className="font-semibold text-gray-700">Descrição:</span>{" "}
              {ticket.descricaoResolucao || "—"}
            </div>

            {ticket.dataResolucao && (
              <div className="bg-gray-50 p-3 rounded-xl border text-gray-600 shadow-sm sm:col-span-3">
                <span className="font-semibold text-gray-700">Data de Resolução:</span>{" "}
                {new Date(ticket.dataResolucao).toLocaleString("pt-BR")}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Imagem */}
      {ticket.imagem && (
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Imagem</h3>
          <div className="flex justify-center">
            <img
              src={ticket.imagem}
              alt="Ticket"
              className="rounded-xl shadow-md max-h-72 object-cover border cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        </section>
      )}

      {/* Modal da imagem */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <img
            src={ticket.imagem}
            alt="Ticket Ampliada"
            className="max-h-[90%] max-w-[90%] rounded-xl shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
