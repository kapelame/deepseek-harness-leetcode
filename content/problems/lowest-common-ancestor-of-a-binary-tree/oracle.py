def lowestCommonAncestor(root, p, q):
    parent = {id(root): None}
    stack = [root]
    while stack:
        node = stack.pop()
        for child in (node.left, node.right):
            if child:
                parent[id(child)] = node
                stack.append(child)
    ancestors = []
    node = p
    while node is not None:
        ancestors.append(node)
        node = parent[id(node)]
    node = q
    while node is not None:
        if any(a is node for a in ancestors):
            return node
        node = parent[id(node)]
    return None
