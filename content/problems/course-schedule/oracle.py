def canFinish(numCourses, prerequisites):
    remaining = set(range(numCourses))
    while remaining:
        free = [c for c in remaining if not any(a == c and b in remaining for a, b in prerequisites)]
        if not free:
            return False
        remaining -= set(free)
    return True
