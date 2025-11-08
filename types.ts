export interface Idea {
  id: string;
  name: string;
  description: string;
  features: string[];
  notes?: string;
}

export interface Folder {
  id: string;
  name: string;
  ideas: Idea[];
  subFolders: Record<string, Folder>;
  theme?: string;
}

export type View = {
  type: 'swipe';
  parentIdea?: Idea | null;
  contextIdeas?: Idea[];
  theme?: string;
  likeTargetFolderPath?: string[];
} | {
  type: 'folders';
  path: string[];
} | {
  type: 'review-swipe';
  path: string[];
} | {
  type: 'idea-detail';
  path: string[];
  ideaId: string;
} | {
  type: 'battle';
  path: string[];
};
