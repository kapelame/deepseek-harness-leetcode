def flatten(root):
    order = []
    def pre(node):
        if node:
            order.append(node)
            pre(node.left)
            pre(node.right)
    pre(root)
    for a, b in zip(order, order[1:] + [None]):
        a.left = None
        a.right = b
