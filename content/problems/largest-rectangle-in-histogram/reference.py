def largestRectangleArea(heights):
    stack, best = [-1], 0
    for i, h in enumerate(heights + [0]):
        while stack[-1] != -1 and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            best = max(best, height * (i - stack[-1] - 1))
        stack.append(i)
    return best
