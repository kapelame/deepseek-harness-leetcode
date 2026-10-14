from collections import deque


def maxLevelSum(root):
    if root is None:
        return 0
    best_sum = None
    best_level = 0
    level = 0
    queue = deque([root])
    while queue:
        level += 1
        total = 0
        for _ in range(len(queue)):
            node = queue.popleft()
            total += node.val
            if node.left is not None:
                queue.append(node.left)
            if node.right is not None:
                queue.append(node.right)
        if best_sum is None or total > best_sum:
            best_sum = total
            best_level = level
    return best_level
