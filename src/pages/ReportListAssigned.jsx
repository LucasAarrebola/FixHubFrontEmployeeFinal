import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export default function ReportListAssigned() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTickets() {
      const token = localStorage.getItem('authToken');

      if (!token) {
        Swal.fire('Erro', 'Usuário não autenticado. Faça login novamente.', 'error');
        setLoading(false);
        return;
      }

      try {
        let url =
          'https://projeto-integrador-fixhub.onrender.com/api/fixhub/tickets-mestre/filtro';

        if (filter !== "TODOS") {
          url += `?status=${filter}`;
        }

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);

        const data = await res.json();

        // REMOVE TICKETS CONCLUÍDOS E REPROVADOS apenas no filtro TODOS
        const filtered =
          filter === "TODOS"
            ? data.filter(t => t.status !== "CONCLUIDO" && t.status !== "REPROVADO")
            : data;

        setTickets(filtered);
      } catch (err) {
        console.error('Erro ao buscar tickets:', err);
        Swal.fire('Erro', 'Não foi possível carregar os tickets.', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [filter]);

  function getStatusLabel(status) {
    switch (status) {
      case "PENDENTE":
        return "Pendente";
      case "EM_ANDAMENTO":
        return "Em andamento";
      case "REPROVADO":
        return "Reprovado";
      case "CONCLUIDO":
        return "Concluído";
      default:
        return status;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "PENDENTE":
        return "text-slate-500";
      case "EM_ANDAMENTO":
        return "text-yellow-600";
      case "REPROVADO":
        return "text-red-600";
      case "CONCLUIDO":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-600">
        Carregando tickets...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.h1
        className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FaClipboardList className="text-blue-600" /> Tickets Atribuídos
      </motion.h1>

      {/* FILTRO AZUL */}
      <div className="flex gap-2 mb-5">
        {["TODOS", "PENDENTE", "EM_ANDAMENTO"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-lg border ${
              filter === status ? "bg-blue-200 border-blue-500 text-blue-800" : "bg-white border-blue-300 text-blue-800"
            }`}
          >
            {status === "EM_ANDAMENTO" ? "Em andamento" : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <p className="text-slate-600">Nenhum ticket encontrado.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex justify-between items-center hover:shadow-md transition cursor-pointer"
              onClick={(e) => {
                // Evita que cliques em links interfiram
                if (e.target.closest('a')) return;
                navigate(`/reports/master/${ticket.id}`);
              }}
            >
              <div>
                <h2 className="font-semibold text-slate-800">
                  {ticket.localizacao || 'Sem título'}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {ticket.descricaoTicketUsuario || 'Sem descrição'}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Andar: {ticket.andar || 'Não informado'}
                </p>

                <p className="text-xs text-slate-400">
                  Área: {ticket.descricaoLocalizacao || 'Não informada'}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Criado em:{' '}
                  {ticket.dataCriacaoTicket
                    ? new Date(ticket.dataCriacaoTicket).toLocaleDateString('pt-BR')
                    : 'Data não informada'}
                </p>

                {/* Prioridade */}
                <div
                  className={`
                    mt-2 p-1 w-max rounded-lg font-semibold text-xs
                    ${ticket.prioridade === "BAIXA" ? "bg-green-100 text-green-700 border border-green-300" : ""}
                    ${ticket.prioridade === "REGULAR" ? "bg-yellow-100 text-yellow-600 border border-yellow-300" : ""}
                    ${ticket.prioridade === "IMPORTANTE" ? "bg-orange-100 text-orange-600 border border-orange-300" : ""}
                    ${ticket.prioridade === "URGENTE" ? "bg-red-100 text-red-600 border border-red-300" : ""}
                  `}
                >
                  {ticket.prioridade || "—"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* STATUS REAL */}
                <span className={`flex items-center gap-1 font-medium text-sm ${getStatusColor(ticket.status)}`}>
                  <FaClock /> {getStatusLabel(ticket.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
