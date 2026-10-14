def maxLevelSum(root):
    if root is None:
        return 0
    best = None
    level = [root]
    while level:
        total = sum(node.val for node in level)
        best = total if best is None else max(best, total)
        level = [child for node in level for child in (node.left, node.right) if child is not None]
    return best
