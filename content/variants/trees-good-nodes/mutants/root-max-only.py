def countLeadingNodes(root):
    if root is None:
        return 0
    def visit(node):
        if node is None:
            return 0
        return (1 if node.val >= root.val else 0) + visit(node.left) + visit(node.right)
    return visit(root)
