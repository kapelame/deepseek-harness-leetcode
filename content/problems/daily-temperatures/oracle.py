def dailyTemperatures(temperatures):
    answer = []
    for i, temperature in enumerate(temperatures):
        wait = 0
        for j in range(i + 1, len(temperatures)):
            if temperatures[j] > temperature:
                wait = j - i
                break
        answer.append(wait)
    return answer
