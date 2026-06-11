import type { Rule } from 'eslint';
import type { 
  CallExpression, 
  IfStatement,
  JSXElement,
  Node
} from 'estree';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent early returns before rendering a ref used with useScroll',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    messages: {
      earlyReturnBeforeScrollRef: 
        'Early return detected in component using useScroll({{ target: {{refName}} }}). ' +
        'This likely causes "Target ref is defined but not hydrated" error. ' +
        'Ensure the ref container renders unconditionally: ' +
        '<div ref={{{{refName}}}}>{isLoading ? <Spinner /> : <Content />}</div>',
    },
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    let useScrollTargetRef: string | null = null;
    let earlyReturnNodes: Node[] = [];

    return {
      // Track refs used with useScroll({ target: someRef })
      CallExpression(node: CallExpression) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useScroll' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'ObjectExpression'
        ) {
          const targetProp = node.arguments[0].properties.find(
            (prop) =>
              prop.type === 'Property' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'target'
          );

          if (
            targetProp &&
            targetProp.type === 'Property' &&
            targetProp.value.type === 'Identifier'
          ) {
            useScrollTargetRef = targetProp.value.name;
          }
        }
      },

      // Detect early returns like: if (isLoading) return <...>
      IfStatement(node: IfStatement) {
        if (!useScrollTargetRef) return;

        const hasReturn =
          node.consequent.type === 'ReturnStatement' ||
          (node.consequent.type === 'BlockStatement' &&
            node.consequent.body.some((stmt) => stmt.type === 'ReturnStatement'));

        if (hasReturn) {
          earlyReturnNodes.push(node);
        }
      },

      // At the end of the component, report if we found both patterns
      'ExportDefaultDeclaration > FunctionDeclaration:exit'() {
        if (useScrollTargetRef && earlyReturnNodes.length > 0) {
          // Report all early returns in a component using useScroll
          earlyReturnNodes.forEach((node) => {
            context.report({
              node,
              messageId: 'earlyReturnBeforeScrollRef',
              data: {
                refName: useScrollTargetRef,
              },
            });
          });
        }
      },

      // Reset for next file
      'Program:exit'() {
        useScrollTargetRef = null;
        earlyReturnNodes = [];
      },
    };
  },
};

