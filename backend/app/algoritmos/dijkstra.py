class MinHeap:
    def __init__(self):
        self.heap = []
        self.pos_map = {}

    def is_empty(self):
        return len(self.heap) == 0

    def parent(self, i):
        return (i - 1) // 2

    def left_child(self, i):
        return 2 * i + 1

    def right_child(self, i):
        return 2 * i + 2

    def swap(self, i, j):
        node_i = self.heap[i]
        node_j = self.heap[j]

        self.pos_map[node_i['node']] = j
        self.pos_map[node_j['node']] = i

        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]