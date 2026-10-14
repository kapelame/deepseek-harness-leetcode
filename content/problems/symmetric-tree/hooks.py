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
    if rng.random() < 0.4:
        return args
    half = _parse(_distinct_tree(rng.randint(0, 6 if size == "small" else 90), -100, 100, rng))
    out = _serialize([rng.randint(-100, 100), half, _flip(half)])
    if rng.random() < 0.3 and len(out) > 2:
        index = rng.randrange(1, len(out))
        if out[index] is not None:
            out[index] = out[index] + 1 if out[index] < 100 else out[index] - 1
    return [out]

def _parse(values):
    if not values:
        return None
    nodes = [None if v is None else [v, None, None] for v in values]
    queue = [nodes[0]]
    i = 1
    head = 0
    while head < len(queue) and i < len(nodes):
        node = queue[head]
        head += 1
        for side in (1, 2):
            if i < len(nodes):
                child = nodes[i]
                i += 1
                node[side] = child
                if child is not None:
                    queue.append(child)
    return nodes[0]

def _flip(node):
    if node is None:
        return None
    return [node[0], _flip(node[2]), _flip(node[1])]

def _serialize(root):
    out = []
    queue = [root]
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        out.append(node[0])
        queue.append(node[1])
        queue.append(node[2])
    while out and out[-1] is None:
        out.pop()
    return out
