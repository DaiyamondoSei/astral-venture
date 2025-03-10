
/**
 * ESLint rule to enforce consistent naming conventions
 * 
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent naming conventions',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          patterns: {
            type: 'object',
            patternProperties: {
              '^.*$': {
                type: 'object',
                properties: {
                  match: { type: 'string' },
                  replacement: { type: 'string' },
                  message: { type: 'string' }
                },
                required: ['match', 'replacement', 'message']
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const patterns = options.patterns || {
      // Default rules for node connections
      nodeConnection: {
        match: '(source|target)',
        replacement: 'from/to',
        message: 'Use from/to instead of source/target for node connections'
      },
      // Event handlers
      eventHandler: {
        match: '^on([A-Z][a-zA-Z0-9]*)$',
        replacement: 'handle$1',
        message: 'Event handlers should be prefixed with "handle" instead of "on"'
      },
      // Boolean variables
      booleanVariable: {
        match: '^([a-z][a-zA-Z0-9]*)$',
        replacement: 'is/has/should$1',
        message: 'Boolean variables should be prefixed with "is", "has", or "should"'
      }
    };

    /**
     * Check property name against patterns
     * 
     * @param {Object} node - AST node
     * @param {string} propName - Property name
     * @param {Object} pattern - Pattern to check against
     */
    function checkPropertyName(node, propName, pattern) {
      const regex = new RegExp(pattern.match);
      if (regex.test(propName)) {
        context.report({
          node,
          message: pattern.message,
          fix(fixer) {
            const newName = propName.replace(regex, pattern.replacement);
            return fixer.replaceText(node.key, newName);
          }
        });
      }
    }

    return {
      // Check object property names
      Property(node) {
        if (node.key.type === 'Identifier') {
          const propName = node.key.name;
          
          // Check property name against all patterns
          Object.values(patterns).forEach(pattern => {
            checkPropertyName(node, propName, pattern);
          });
        }
      },
      
      // Check interface property names
      TSPropertySignature(node) {
        if (node.key.type === 'Identifier') {
          const propName = node.key.name;
          
          // Check property name against all patterns
          Object.values(patterns).forEach(pattern => {
            checkPropertyName(node, propName, pattern);
          });
        }
      }
    };
  }
};
