def rightSideView(root):
    out, level = [], [root] if root else []
    while level:
        out.append(level[-1].val)
        level = [child for node in level for child in (node.left, node.right) if child]
    return out
