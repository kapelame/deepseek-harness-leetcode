def pathSum(root, targetSum):
    def from_here(node, need):
        if node is None:
            return 0
        need -= node.val
        return (1 if need == 0 else 0) + from_here(node.left, need) + from_here(node.right, need)
    def every(node):
        if node is None:
            return 0
        return from_here(node, targetSum) + every(node.left) + every(node.right)
    return every(root)
