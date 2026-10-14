def isSymmetric(root):
    levels = []
    layer = [root]
    while any(node is not None for node in layer):
        values = [None if node is None else node.val for node in layer]
        if values != values[::-1]:
            return False
        nxt = []
        for node in layer:
            if node is None:
                nxt.extend([None, None])
            else:
                nxt.extend([node.left, node.right])
        layer = nxt
    return True
