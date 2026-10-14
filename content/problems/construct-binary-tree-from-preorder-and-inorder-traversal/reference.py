def buildTree(preorder, inorder):
    index = {v: i for i, v in enumerate(inorder)}
    pos = 0
    def build(lo, hi):
        nonlocal pos
        if lo > hi:
            return None
        value = preorder[pos]
        pos += 1
        node = TreeNode(value)
        mid = index[value]
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(inorder) - 1)
