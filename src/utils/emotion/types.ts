
// Fix missing types
export type SacredGeometryType = 
  | 'flowerOfLife' 
  | 'metatronsCube' 
  | 'sriYantra' 
  | 'seedOfLife' 
  | 'vesicaPiscis'
  | 'treeOfLife';

export type GeometryResourceType = {
  type: SacredGeometryType;
  path: string;
  description: string;
  energyLevel: number;
};
