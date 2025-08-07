import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getTicket, type Ticket} from '../api/tickets';
import {getComments, createComment, deleteComment, type Comment} from '../api/comments';
import {useAuth} from '../context/AuthContext';

export default function TicketDetails() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (id) {
            loadTicketAndComments();
        }
    }, [id]);

    const loadTicketAndComments = async () => {
        if (!id) return;

        try {
            const [ticketData, commentsData] = await Promise.all([
                getTicket(id),
                getComments(id)
            ]);

            setTicket(ticketData);
            setComments(commentsData);
        } catch (error) {
            console.error('Failed to load ticket details:', error);
            alert('Failed to load ticket details');
            navigate('/tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !id) return;

        setSubmittingComment(true);
        try {
            const comment = await createComment({
                content: newComment.trim(),
                ticketId: id,
            });

            setComments([...comments, comment]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await deleteComment(commentId);
            setComments(comments.filter(comment => comment._id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
            case 'CLOSED':
                return 'px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800';
            default:
                return 'px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading ticket details...</div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Ticket not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/tickets')}
                        className="btn btn-secondary px-4 py-2 rounded-lg mb-4 animate-fade-in"
                    >
                        ← Back to Tickets
                    </button>

                    <div className="card p-6 animate-slide-in">
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
                            <span className={getStatusBadgeClass(ticket.status)}>
                {ticket.status.replace('_', ' ')}
              </span>
                        </div>

                        {ticket.description && (
                            <p className="text-gray-700 mb-4">{ticket.description}</p>
                        )}

                        <div className="text-sm text-gray-500">
                            <p>Created: {formatDate(ticket.createdAt)}</p>
                            <p>Updated: {formatDate(ticket.updatedAt)}</p>
                            <p>Ticket ID: {ticket._id}</p>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="card p-6 animate-scale-in">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Comments ({comments.length})
                    </h2>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows={3}
                required
            />
                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={submittingComment || !newComment.trim()}
                                className="btn btn-primary px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingComment ? 'Adding...' : 'Add Comment'}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No comments yet. Be the first to comment!
                            </div>
                        ) : (
                            comments.map((comment, index) => (
                                <div
                                    key={comment._id}
                                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in"
                                    style={{animationDelay: `${index * 0.1}s`}}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                {comment.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{comment.username}</p>
                                                <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                                            </div>
                                        </div>

                                        {user?._id === comment.userId && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
