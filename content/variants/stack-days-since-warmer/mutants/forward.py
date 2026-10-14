def daysSinceWarmer(temperatures):
    answer = [0] * len(temperatures)
    stack = []
    for i, temperature in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temperature:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer
