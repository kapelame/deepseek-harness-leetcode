def pathSum(root, targetSum):
    counts = {0: 1}
    def dfs(node, total):
        if node is None:
            return 0
        total += node.val
        found = counts.get(total - targetSum, 0)
        counts[total] = counts.get(total, 0) + 1
        found += dfs(node.left, total) + dfs(node.right, total)
        counts[total] -= 1
        return found
    return dfs(root, 0)
