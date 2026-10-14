def maxLevelSum(root):
    sums = {}

    def visit(node, depth):
        if node is None:
            return
        sums[depth] = sums.get(depth, 0) + node.val
        visit(node.left, depth + 1)
        visit(node.right, depth + 1)

    visit(root, 1)
    if not sums:
        return 0
    best = max(sums.values())
    return min(depth for depth, total in sums.items() if total == best)
