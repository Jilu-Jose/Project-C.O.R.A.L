class RoleManager:

    def should_continue(
            self, 
            critic_feedback: str,
            round_count: int
    ):
        if round_count >= 2:
            return False
        
        keywords = [
            "incorrect",
            "missing",
            "hallucination",
            "weak",
            "improve"
        ]

        feedback_lower = critic_feedback.lower()

        for word in keywords:
            if word in feedback_lower:
                return True            
        return False