export default function getFormData(node) {
  if (!(node instanceof HTMLElement)) {
    throw Error('Argument must be HTMLElement');
  }

  const { nodeName, name } = node;
  if (nodeName === 'SELECT') {
    return {
      [name]: node.selectedOptions[0].value
    };
  }
  if (nodeName === 'INPUT') {
    const value = ['checkbox', 'radio'].includes(node.type) ? node.checked : node.value;
    return {
      [name]: value
    };
  }
  throw Error(`Unhandled node type: ${node.nodeName}`);
}
