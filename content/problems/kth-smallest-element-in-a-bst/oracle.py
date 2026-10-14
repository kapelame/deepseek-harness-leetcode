def kthSmallest(root, k):
    values = []
    stack = [root]
    while stack:
        node = stack.pop()
        if node:
            values.append(node.val)
            stack.append(node.left)
            stack.append(node.right)
    return sorted(values)[k - 1]
