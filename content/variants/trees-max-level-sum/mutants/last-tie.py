def maxLevelSum(root):
    best_sum = None
    best_level = 0
    depth = 0
    level = [root] if root is not None else []
    while level:
        depth += 1
        total = sum(node.val for node in level)
        if best_sum is None or total >= best_sum:
            best_sum = total
            best_level = depth
        level = [child for node in level for child in (node.left, node.right) if child is not None]
    return best_level
