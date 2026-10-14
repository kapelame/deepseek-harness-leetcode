def _shape(n, rng):
    if n == 0:
        return None
    nodes = [[None, None] for _ in range(n)]
    order = list(range(n))
    root = 0
    for i in range(1, n):
        cur = root
        while True:
            side = rng.randint(0, 1)
            if nodes[cur][side] is None:
                nodes[cur][side] = i
                break
            cur = nodes[cur][side]
    return nodes, root

def _inorder_ids(nodes, root):
    out = []
    stack = []
    cur = root
    while stack or cur is not None:
        while cur is not None:
            stack.append(cur)
            cur = nodes[cur][0]
        cur = stack.pop()
        out.append(cur)
        cur = nodes[cur][1]
    return out

def _level(nodes, root, value):
    if root is None:
        return []
    out = []
    queue = [root]
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        out.append(value[node])
        queue.append(nodes[node][0])
        queue.append(nodes[node][1])
    while out and out[-1] is None:
        out.pop()
    return out

def _bst(values, rng):
    built = _shape(len(values), rng)
    if built is None:
        return []
    nodes, root = built
    ids = _inorder_ids(nodes, root)
    value = {}
    for node, v in zip(ids, sorted(values)):
        value[node] = v
    return _level(nodes, root, value)

def _distinct_tree(n, low, high, rng):
    built = _shape(n, rng)
    if built is None:
        return []
    nodes, root = built
    vals = rng.sample(range(low, high + 1), n)
    return _level(nodes, root, dict(enumerate(vals)))

def adjust(args, rng, size):
    n = rng.randint(1, 8) if size == "small" else 3000
    low, high = (-5, 9) if size == "small" else (-2147483648, 2147483647)
    values = rng.sample(range(low, high + 1), n) if high - low + 1 >= n else [rng.randint(low, high) for _ in range(n)]
    tree = _bst(values, rng)
    if rng.random() < 0.5 and n > 1:
        present = [i for i, v in enumerate(tree) if v is not None]
        a, b = rng.sample(present, 2)
        tree[a], tree[b] = tree[b], tree[a]
    return [tree]
