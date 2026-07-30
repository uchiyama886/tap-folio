export type PortfolioItem = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  imageUrl: string;
  createdAt: string;
};

export type ShareLink = {
  token: string;
  portfolioId: string;
  expiresAt: string | null;
};
