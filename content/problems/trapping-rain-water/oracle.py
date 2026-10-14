def trap(height):
    total = 0
    for i in range(len(height)):
        level = min(max(height[:i + 1]), max(height[i:]))
        total += level - height[i]
    return total
