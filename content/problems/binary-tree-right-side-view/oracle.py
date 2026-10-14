def rightSideView(root):
    seen = {}
    def dfs(node, depth):
        if node is None:
            return
        seen[depth] = node.val
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)
    dfs(root, 0)
    return [seen[d] for d in range(len(seen))]
