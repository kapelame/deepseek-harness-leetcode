def diameterOfBinaryTree(root):
    nodes, adjacency = [], {}
    stack = [(root, None)]
    while stack:
        node, parent = stack.pop()
        if node is None:
            continue
        nodes.append(node)
        adjacency.setdefault(id(node), [])
        if parent is not None:
            adjacency[id(node)].append(parent)
            adjacency[id(parent)].append(node)
        stack.append((node.left, node))
        stack.append((node.right, node))
    best = 0
    for start in nodes:
        dist = {id(start): 0}
        queue = [start]
        for cur in queue:
            for nxt in adjacency[id(cur)]:
                if id(nxt) not in dist:
                    dist[id(nxt)] = dist[id(cur)] + 1
                    queue.append(nxt)
        best = max(best, max(dist.values()))
    return best
