def maxArea(height):
    return max((j - i) * min(height[i], height[j]) for i in range(len(height)) for j in range(i + 1, len(height)))
