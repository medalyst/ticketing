import { useState, useEffect } from 'react';
import { getTickets, createTicket, updateTicket, deleteTicket, type Ticket, type GetTicketsParams } from '../api/tickets';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Tickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED'>('ALL');
    const [sortBy, setSortBy] = useState<'createdAt' | 'title'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
    });

    useEffect(() => {
        loadTickets();
    }, [searchTerm, statusFilter, sortBy, sortOrder]);

    const loadTickets = async () => {
        try {
            const params: GetTicketsParams = {
                sortBy,
                sortOrder,
            };

            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            if (statusFilter !== 'ALL') {
                params.status = statusFilter;
            }

            const ticketsData = await getTickets(params);
            setTickets(ticketsData);
        } catch (error) {
            console.error('Failed to load tickets:', error);
            alert('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAddTicket = () => {
        setEditingTicket(null);
        setFormData({ title: '', description: '', status: 'OPEN' });
        setShowModal(true);
    };

    const handleEditTicket = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setFormData({
            title: ticket.title,
            description: ticket.description || '',
            status: ticket.status,
        });
        setShowModal(true);
    };

    const handleViewTicket = (ticketId: string) => {
        navigate(`/tickets/${ticketId}`);
    };

    const handleDeleteTicket = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ticket?')) return;

        try {
            await deleteTicket(id);
            setTickets(tickets.filter(ticket => ticket._id !== id));
        } catch (error) {
            console.error('Failed to delete ticket:', error);
            alert('Failed to delete ticket');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingTicket) {
                // Update existing ticket
                const updatedTicket = await updateTicket(editingTicket._id, formData);
                setTickets(tickets.map(ticket =>
                    ticket._id === editingTicket._id ? updatedTicket : ticket
                ));
            } else {
                // Create new ticket
                const newTicket = await createTicket(formData);
                setTickets([newTicket, ...tickets]);
            }

            setShowModal(false);
            setFormData({ title: '', description: '', status: 'OPEN' });
        } catch (error) {
            console.error('Failed to save ticket:', error);
            alert('Failed to save ticket');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'status-badge px-3 py-1 rounded-full bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'status-badge px-3 py-1 rounded-full bg-yellow-100 text-yellow-800';
            case 'CLOSED':
                return 'status-badge px-3 py-1 rounded-full bg-red-100 text-red-800';
            default:
                return 'status-badge px-3 py-1 rounded-full bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600 animate-fade-in">Loading tickets...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-in">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
                        <p className="text-gray-600 mt-1">Welcome back, {user?.username}!</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAddTicket}
                            className="btn btn-primary px-6 py-3 rounded-lg"
                        >
                            Add New Ticket
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn btn-danger px-6 py-3 rounded-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="card p-6 mb-8 animate-scale-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title or ticket ID..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="createdAt">Creation Date</option>
                                <option value="title">Title</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tickets Grid */}
                {tickets.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="text-gray-500 text-lg">
                            {searchTerm || statusFilter !== 'ALL'
                                ? 'No tickets match your search criteria'
                                : 'No tickets found. Create your first ticket!'
                            }
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.map((ticket, index) => (
                            <div
                                key={ticket._id}
                                className="card p-6 cursor-pointer group animate-fade-in hover:scale-105 transition-transform duration-200"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => handleViewTicket(ticket._id)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                                        {ticket.title}
                                    </h3>
                                    <span className={getStatusBadgeClass(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                                </div>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {ticket.description || 'No description'}
                                </p>

                                <div className="text-sm text-gray-500 mb-4">
                                    <p>Created: {formatDate(ticket.createdAt)}</p>
                                    <p className="text-xs text-gray-400">ID: {ticket._id.slice(-8)}</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewTicket(ticket._id);
                                        }}
                                        className="btn btn-primary px-4 py-2 text-sm rounded-lg"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditTicket(ticket);
                                        }}
                                        className="btn btn-warning px-4 py-2 text-sm rounded-lg"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTicket(ticket._id);
                                        }}
                                        className="btn btn-danger px-4 py-2 text-sm rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay flex items-center justify-center p-4 animate-fade-in">
                        <div className="modal-content max-w-md w-full p-6 animate-scale-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingTicket ? 'Edit Ticket' : 'Add New Ticket'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ticket title"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description (optional)"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn btn-secondary px-6 py-2 rounded-lg flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success px-6 py-2 rounded-lg flex-1"
                                    >
                                        {editingTicket ? 'Update' : 'Create'} Ticket
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}