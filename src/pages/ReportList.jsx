import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaEdit, FaTrashAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export default function ReportList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');

  useEffect(() => {
    async function fetchTickets() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        Swal.fire('Erro', 'Usuário não autenticado. Faça login novamente.', 'error');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          'https://projeto-integrador-fixhub.onrender.com/api/fixhub/tickets/listar-meus-tickets',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) throw new Error(`Erro: ${res.status}`);

        const raw = await res.text();
        let data = [];
        try {
          data = raw ? JSON.parse(raw) : [];
        } catch (err) {
          console.error('Erro ao analisar JSON:', err);
        }

        const normalized = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              id: item.id || item._id,
            }))
          : [];

        // Filtra pelo status escolhido
        const filteredByStatus =
          filter === 'TODOS'
            ? normalized
            : normalized.filter((t) => t.status === filter);

        setTickets(filteredByStatus);
      } catch (err) {
        console.error('Erro ao buscar tickets:', err);
        Swal.fire('Erro', 'Não foi possível carregar os tickets.', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [filter]);

  const deleteTicket = async (id) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      Swal.fire('Erro', 'Usuário não autenticado. Faça login novamente.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Confirma exclusão?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `https://projeto-integrador-fixhub.onrender.com/api/fixhub/tickets/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error(`Erro ao deletar: ${res.status}`);

      setTickets((prev) => prev.filter((t) => (t.id || t._id) !== id));
      Swal.fire('Removido', 'Ticket excluído com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao excluir ticket:', error);
      Swal.fire('Erro', 'Não foi possível excluir o ticket.', 'error');
    }
  };

  // Helpers para status
  function getStatusLabel(status) {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'CONCLUIDO':
        return 'Concluído';
      case 'REPROVADO':
        return 'Reprovado';
      default:
        return status;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'PENDENTE':
        return 'text-slate-500';
      case 'EM_ANDAMENTO':
        return 'text-yellow-600';
      case 'CONCLUIDO':
        return 'text-green-600';
      case 'REPROVADO':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  }

  function getStatusBg(status) {
    switch (status) {
      case 'PENDENTE':
        return 'bg-slate-100';
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100';
      case 'CONCLUIDO':
        return 'bg-green-100';
      case 'REPROVADO':
        return 'bg-red-100';
      default:
        return 'bg-slate-100';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'PENDENTE':
        return <FaClock />;
      case 'EM_ANDAMENTO':
        return <FaExclamationCircle />;
      case 'CONCLUIDO':
        return <FaCheckCircle />;
      case 'REPROVADO':
        return <FaExclamationCircle />;
      default:
        return <FaClock />;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-600">
        Carregando seus tickets...
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
        <FaClipboardList className="text-blue-600" /> Seus Tickets
      </motion.h1>

      {/* Filtro */}
      <div className="flex gap-2 mb-5">
        {['TODOS', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'REPROVADO'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg border ${
                filter === status
                  ? 'bg-blue-200 border-blue-500 text-blue-800'
                  : 'bg-white border-blue-300 text-blue-800'
              }`}
            >
              {getStatusLabel(status)}
            </button>
          )
        )}
      </div>

      {/* Lista de tickets */}
      {tickets.length === 0 ? (
        <p className="text-slate-600">
          {filter === 'TODOS'
            ? 'Você ainda não criou nenhum ticket.'
            : 'Nenhum ticket encontrado para o filtro selecionado.'}
        </p>
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
                  {ticket.title || ticket.localizacao || 'Ticket sem título'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {ticket.description || ticket.descricaoTicketUsuario || 'Sem descrição'}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Criado em:{' '}
                  {ticket.dataTicket
                    ? new Date(ticket.dataTicket).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                      })
                    : 'Data não informada'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-1 font-medium text-sm px-2 py-1 rounded-lg ${getStatusBg(
                    ticket.status
                  )} ${getStatusColor(ticket.status)}`}
                >
                  {getStatusIcon(ticket.status)} {getStatusLabel(ticket.status)}
                </span>

                <Link
                  to={`/reports/${ticket.id || ticket._id}`}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                >
                  Ver Detalhes
                </Link>

                <Link
                  to={`/reports/edit/${ticket.id || ticket._id}`}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  <FaEdit />
                </Link>

                <button
                  onClick={() => deleteTicket(ticket.id || ticket._id)}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Excluir"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link
          to="/reports/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow"
        >
          Criar Novo Ticket
        </Link>
      </div>
    </div>
  );
}
