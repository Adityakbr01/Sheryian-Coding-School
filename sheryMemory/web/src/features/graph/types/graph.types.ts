export type NodeType = 'video' | 'article' | 'tweet' | 'pdf' | 'tag' | 'default';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  nodeType: 'item' | 'tag';
  group?: string;
  val?: number;
  summary?: string;
  tags?: string[];
  color?: string;
  imageUrl?: string | null;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label: 'strong' | 'medium' | 'weak' | 'tag';
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
