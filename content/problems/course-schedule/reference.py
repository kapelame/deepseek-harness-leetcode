from collections import deque
def canFinish(numCourses, prerequisites):
    indegree = [0] * numCourses
    after = [[] for _ in range(numCourses)]
    for a, b in prerequisites:
        after[b].append(a)
        indegree[a] += 1
    queue = deque(i for i in range(numCourses) if indegree[i] == 0)
    taken = 0
    while queue:
        course = queue.popleft()
        taken += 1
        for nxt in after[course]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return taken == numCourses
