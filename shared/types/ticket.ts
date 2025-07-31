export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export type Ticket = {
    _id: string;
    title: string;
    description: string;
    status: TicketStatus;
    createdBy: string;
    createdAt: string;
};
