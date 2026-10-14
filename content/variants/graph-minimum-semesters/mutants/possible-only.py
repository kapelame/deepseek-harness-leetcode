def minimumSemesters(n, relations):
    indegree = [0] * n
    after = [[] for _ in range(n)]
    for a, b in relations:
        after[b].append(a)
        indegree[a] += 1
    queue = [i for i in range(n) if indegree[i] == 0]
    taken = 0
    while queue:
        course = queue.pop()
        taken += 1
        for later in after[course]:
            indegree[later] -= 1
            if indegree[later] == 0:
                queue.append(later)
    return 1 if taken == n else -1
