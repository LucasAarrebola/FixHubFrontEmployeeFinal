import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export default function ReportListClosed() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("TODOS");

  useEffect(() => {
    async function fetchTickets() {
      const token = localStorage.getItem('authToken');

      if (!token) {
        Swal.fire('Erro', 'Usuário não autenticado. Faça login novamente.', 'error');
        setLoading(false);
        return;
      }

      try {
        let url = 'https://projeto-integrador-fixhub.onrender.com/api/fixhub/tickets-mestre/filtro';

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

        // Mantém apenas tickets fechados: CONCLUIDO ou REPROVADO
        const filtered = data.filter(t => t.status === "CONCLUIDO" || t.status === "REPROVADO");

        // Aplica filtro local
        const finalTickets = filter === "TODOS"
          ? filtered
          : filtered.filter(t => t.status === filter);

        setTickets(finalTickets);
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
      case "CONCLUIDO":
        return "Concluído";
      case "REPROVADO":
        return "Reprovado";
      default:
        return status;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "CONCLUIDO":
        return "text-green-600";
      case "REPROVADO":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "CONCLUIDO":
        return <FaCheckCircle />;
      case "REPROVADO":
        return <FaTimesCircle />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-600">
        Carregando tickets fechados...
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
        <FaClipboardList className="text-slate-600" /> Tickets Fechados
      </motion.h1>

      {/* FILTRO AZUL */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setFilter("TODOS")}
          className={`px-3 py-1 rounded-lg border ${
            filter === "TODOS" ? "bg-blue-200 border-blue-500 text-blue-800" : "bg-white border-blue-300 text-blue-800"
          }`}
        >
          Todos
        </button>

        <button
          onClick={() => setFilter("CONCLUIDO")}
          className={`px-3 py-1 rounded-lg border ${
            filter === "CONCLUIDO" ? "bg-blue-200 border-blue-500 text-blue-800" : "bg-white border-blue-300 text-blue-800"
          }`}
        >
          Concluídos
        </button>

        <button
          onClick={() => setFilter("REPROVADO")}
          className={`px-3 py-1 rounded-lg border ${
            filter === "REPROVADO" ? "bg-blue-200 border-blue-500 text-blue-800" : "bg-white border-blue-300 text-blue-800"
          }`}
        >
          Reprovados
        </button>
      </div>

      {tickets.length === 0 ? (
        <p className="text-slate-600">Nenhum ticket encontrado para o filtro selecionado.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <motion.div
              key={ticket.id || ticket._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex justify-between items-center hover:shadow-md transition"
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
              </div>

              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 font-medium text-sm ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)} {getStatusLabel(ticket.status)}
                </span>

                <Link
                  to={`/reports/master/${ticket.id || ticket._id}`}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition"
                >
                  Ver Detalhes
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
