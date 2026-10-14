def maxDepth(root):
    depth = 0
    level = [root] if root is not None else []
    while level:
        depth += 1
        level = [child for node in level for child in (node.left, node.right) if child is not None]
    return depth
