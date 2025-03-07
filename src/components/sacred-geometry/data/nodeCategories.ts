
import { NodeCategory } from './nodeCategoryTypes';
import coreNodeCategories from './categories/coreCategories';
import advancedNodeCategories from './categories/advancedCategories';
import elementalNodeCategories from './categories/elementalCategories';
import userNodeCategories from './categories/userCategories';

// Export core categories
export const nodeCategories = coreNodeCategories;

// Export all node categories
export const allNodeCategories = {
  ...coreNodeCategories,
  ...advancedNodeCategories,
  ...elementalNodeCategories,
  ...userNodeCategories
};

// Export specific category groups
export { 
  advancedNodeCategories,
  elementalNodeCategories,
  userNodeCategories
};
