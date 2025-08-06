export interface Comment {
  _id: string;
  ticket: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  content: string;
  createdAt: string;
}
