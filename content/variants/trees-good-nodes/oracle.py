def countLeadingNodes(root):
    count = 0
    stack = [(root, [])] if root is not None else []
    while stack:
        node, path = stack.pop()
        if all(node.val >= value for value in path):
            count += 1
        for child in (node.left, node.right):
            if child is not None:
                stack.append((child, path + [node.val]))
    return count
