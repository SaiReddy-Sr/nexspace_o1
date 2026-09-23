export type BrainNodeType = 'note' | 'snippet' | 'project_bookmark';

export interface BrainCollection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrainNode {
  id: string;
  user_id: string;
  collection_id: string | null;
  title: string;
  content: string | null;
  type: BrainNodeType;
  reference_url: string | null;
  reference_project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrainTag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface BrainNodeTag {
  node_id: string;
  tag_id: string;
}

export interface BrainNodeWithTags extends BrainNode {
  tags: BrainTag[];
}
