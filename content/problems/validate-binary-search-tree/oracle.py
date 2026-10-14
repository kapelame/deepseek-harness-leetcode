def isValidBST(root):
    def values(node):
        return [] if node is None else values(node.left) + [node.val] + values(node.right)
    def ok(node):
        if node is None:
            return True
        return all(v < node.val for v in values(node.left)) and all(v > node.val for v in values(node.right)) and ok(node.left) and ok(node.right)
    return ok(root)
