def daysSinceWarmer(temperatures):
    answer = []
    for i, temperature in enumerate(temperatures):
        found = 0
        for j in range(i - 1, -1, -1):
            if temperatures[j] > temperature:
                found = i - j
                break
        answer.append(found)
    return answer
