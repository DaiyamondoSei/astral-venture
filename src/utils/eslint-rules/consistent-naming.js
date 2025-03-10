
/**
 * @fileoverview Rule to enforce consistent naming for connections and other entities
 * @author Technical Debt Expert
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce consistent naming for connections and other entities",
      category: "Stylistic Issues",
      recommended: true,
    },
    fixable: "code",
    schema: [], // no options
    messages: {
      connectionNaming: "Use 'from/to' pattern for connections instead of 'source/target'",
      prefixInterface: "Interface names should be prefixed with 'I'",
      handlerPrefix: "Event handler functions should be prefixed with 'handle'",
      asyncSuffix: "Async functions should use descriptive verb suffix"
    }
  },

  create(context) {
    return {
      // Check for source/target in object literals (should use from/to)
      ObjectExpression(node) {
        const properties = node.properties;
        let hasSource = false;
        let hasTarget = false;
        
        for (const property of properties) {
          if (property.type === "Property") {
            const keyName = property.key.name || property.key.value;
            if (keyName === "source") hasSource = true;
            if (keyName === "target") hasTarget = true;
          }
        }
        
        if (hasSource && hasTarget) {
          context.report({
            node,
            messageId: "connectionNaming",
            fix(fixer) {
              const sourceNodes = properties.filter(p => 
                p.type === "Property" && 
                (p.key.name === "source" || p.key.value === "source")
              );
              
              const targetNodes = properties.filter(p => 
                p.type === "Property" && 
                (p.key.name === "target" || p.key.value === "target")
              );
              
              const fixes = [];
              
              if (sourceNodes.length) {
                fixes.push(fixer.replaceText(sourceNodes[0].key, "from"));
              }
              
              if (targetNodes.length) {
                fixes.push(fixer.replaceText(targetNodes[0].key, "to"));
              }
              
              return fixes;
            }
          });
        }
      },
      
      // Check for interfaces without 'I' prefix
      TSInterfaceDeclaration(node) {
        const name = node.id.name;
        if (!name.startsWith('I')) {
          context.report({
            node,
            messageId: "prefixInterface",
            fix(fixer) {
              return fixer.replaceText(node.id, `I${name}`);
            }
          });
        }
      },
      
      // Event handler function naming
      FunctionDeclaration(node) {
        const name = node.id?.name;
        if (name && 
            (name.includes('click') || 
             name.includes('change') || 
             name.includes('submit') || 
             name.includes('select')) && 
            !name.startsWith('handle')) {
          context.report({
            node,
            messageId: "handlerPrefix"
          });
        }
      }
    };
  }
};
