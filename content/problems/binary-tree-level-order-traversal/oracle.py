def levelOrder(root):
    levels = []

    def visit(node, depth):
        if node is None:
            return
        if depth == len(levels):
            levels.append([])
        levels[depth].append(node.val)
        visit(node.left, depth + 1)
        visit(node.right, depth + 1)

    visit(root, 0)
    return levels
