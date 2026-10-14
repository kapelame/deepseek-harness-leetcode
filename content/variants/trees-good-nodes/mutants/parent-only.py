def countLeadingNodes(root):
    def visit(node, parent):
        if node is None:
            return 0
        here = 1 if parent is None or node.val >= parent else 0
        return here + visit(node.left, node.val) + visit(node.right, node.val)
    return visit(root, None)
