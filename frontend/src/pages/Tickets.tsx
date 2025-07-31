import { useState, useEffect } from 'react';
import { getTickets, createTicket, updateTicket, deleteTicket, type Ticket } from '../api/tickets';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  ticketGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  ticketCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  ticketTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  ticketDescription: {
    color: '#666',
    marginBottom: '12px',
    minHeight: '20px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
  },
  statusOpen: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusInProgress: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusClosed: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  ticketActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90vw',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    minHeight: '80px',
    resize: 'vertical' as const,
  },
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  modalActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '18px',
    padding: '40px',
  },
};

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const { logout } = useAuth();
   const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const ticketsData = await getTickets();
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
        setTickets([...tickets, newTicket]);
      }
      
      setShowModal(false);
      setFormData({ title: '', description: '', status: 'OPEN' });
    } catch (error) {
      console.error('Failed to save ticket:', error);
      alert('Failed to save ticket');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { ...styles.statusBadge, ...styles.statusOpen };
      case 'IN_PROGRESS':
        return { ...styles.statusBadge, ...styles.statusInProgress };
      case 'CLOSED':
        return { ...styles.statusBadge, ...styles.statusClosed };
      default:
        return styles.statusBadge;
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading tickets...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Tickets</h1>
        <div style={styles.headerActions}>
          <button style={styles.addButton} onClick={handleAddTicket}>
          Add New Ticket
        </button>
        <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
        </button>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div style={styles.emptyState}>
          No tickets found. Create your first ticket!
        </div>
      ) : (
        <div style={styles.ticketGrid}>
          {tickets.map(ticket => (
            <div key={ticket._id} style={styles.ticketCard}>
              <h3 style={styles.ticketTitle}>{ticket.title}</h3>
              <p style={styles.ticketDescription}>
                {ticket.description || 'No description'}
              </p>
              <div style={getStatusStyle(ticket.status)}>
                {ticket.status}
              </div>
              <div style={styles.ticketActions}>
                <button 
                  style={styles.editButton}
                  onClick={() => handleEditTicket(ticket)}
                >
                  Edit
                </button>
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDeleteTicket(ticket._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{editingTicket ? 'Edit Ticket' : 'Add New Ticket'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Ticket title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                style={styles.textarea}
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <select
                style={styles.select}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveButton}>
                  {editingTicket ? 'Update' : 'Create'} Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
