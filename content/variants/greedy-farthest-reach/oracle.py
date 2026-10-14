def farthestIndex(nums):
    reached = {0}
    frontier = [0]
    while frontier:
        i = frontier.pop()
        for j in range(i + 1, min(len(nums), i + nums[i] + 1)):
            if j not in reached:
                reached.add(j)
                frontier.append(j)
    return max(reached)
