class DebateMemory:

    def __init__(self):
        self.history = []

    def add(self, role: str, content: str):

        self.history.append({
            "role": role,
            "content": content
        })

    def get_history(self):
        return self.history
    
    def clear(self):
        self.history = []

    def search(self, query: str, top_k: int = 3) -> str:
        """
        Search past debate entries for content relevant to the query.
        Uses simple keyword overlap scoring (Jaccard-like).
        Returns a formatted string of the most relevant past entries.
        """
        if not self.history:
            return ""

        query_words = set(query.lower().split())
        scored = []

        for entry in self.history:
            content = entry.get("content", "")
            content_words = set(content.lower().split())
            if not content_words:
                continue
            overlap = len(query_words & content_words)
            score = overlap / max(len(query_words | content_words), 1)
            if score > 0.05:  # minimum relevance threshold
                scored.append((score, entry))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_entries = scored[:top_k]

        if not top_entries:
            return ""

        lines = []
        for _score, entry in top_entries:
            role = entry.get("role", "unknown")
            content = entry.get("content", "")
            # Truncate long entries
            if len(content) > 500:
                content = content[:500] + "..."
            lines.append(f"[{role.upper()}]: {content}")

        return "\n---\n".join(lines)