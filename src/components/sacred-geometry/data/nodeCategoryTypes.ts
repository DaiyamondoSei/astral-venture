
// Node functionality and category type definitions
export interface NodeFunctionality {
  name: string;
  description: string;
}

export interface NodeCategory {
  id: string;
  functionalities: NodeFunctionality[];
}
