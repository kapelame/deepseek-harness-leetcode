def daysSinceWarmer(temperatures):
    answer = []
    stack = []
    for i, temperature in enumerate(temperatures):
        while stack and temperatures[stack[-1]] <= temperature:
            stack.pop()
        answer.append(i - stack[-1] if stack else 0)
        stack.append(i)
    return answer
