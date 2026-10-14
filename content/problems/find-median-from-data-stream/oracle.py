class MedianFinder:
    def __init__(self):
        self.values = []

    def addNum(self, num):
        self.values.append(num)

    def findMedian(self):
        ordered = sorted(self.values)
        n = len(ordered)
        return float(ordered[n // 2]) if n % 2 else (ordered[n // 2 - 1] + ordered[n // 2]) / 2
