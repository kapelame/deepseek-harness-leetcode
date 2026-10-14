def countLeadingNodes(root):
    def visit(node, path_max):
        if node is None:
            return 0
        here = 1 if node.val >= path_max else 0
        best = max(path_max, node.val)
        return here + visit(node.left, best) + visit(node.right, best)
    return visit(root, -10 ** 18)
