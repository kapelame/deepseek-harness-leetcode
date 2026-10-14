def invertTree(root):
    queue = [root] if root is not None else []
    while queue:
        node = queue.pop()
        node.left, node.right = node.right, node.left
        queue.extend(child for child in (node.left, node.right) if child is not None)
    return root
