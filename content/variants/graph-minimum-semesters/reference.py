def minimumSemesters(n, relations):
    indegree = [0] * n
    after = [[] for _ in range(n)]
    for a, b in relations:
        after[b].append(a)
        indegree[a] += 1
    level = [i for i in range(n) if indegree[i] == 0]
    taken = semesters = 0
    while level:
        semesters += 1
        taken += len(level)
        nxt = []
        for course in level:
            for later in after[course]:
                indegree[later] -= 1
                if indegree[later] == 0:
                    nxt.append(later)
        level = nxt
    return semesters if taken == n else -1
