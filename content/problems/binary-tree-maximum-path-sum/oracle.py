def maxPathSum(root):
    adjacency = {}
    nodes = []
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
    best = None
    for start in nodes:
        sums = {id(start): start.val}
        queue = [start]
        for cur in queue:
            for nxt in adjacency[id(cur)]:
                if id(nxt) not in sums:
                    sums[id(nxt)] = sums[id(cur)] + nxt.val
                    queue.append(nxt)
        top = max(sums.values())
        best = top if best is None else max(best, top)
    return best
